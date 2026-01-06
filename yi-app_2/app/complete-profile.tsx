import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import ScreenWrapper from '../components/ScreenWrapper';

// 1. IMPORTS
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons'; 

export default function CompleteProfile() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // --- FORM STATE ---
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [batchYear, setBatchYear] = useState('');
   
  const [dob, setDob] = useState(''); 
  const [jobStartDate, setJobStartDate] = useState('');

  const [tag1, setTag1] = useState('');
  const [tag2, setTag2] = useState('');
  const [tag3, setTag3] = useState('');

  // --- DATE PICKER STATE ---
  const [pickerMode, setPickerMode] = useState(null); // 'dob' | 'job' | null
  const [pickerDate, setPickerDate] = useState(new Date());

  // --- HELPERS ---

  // 1. Handle Typing (Auto-slash)
  const handleDateChange = (text, setter) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    if (cleaned.length > 4) formatted = formatted.slice(0, 5) + '/' + formatted.slice(5);
    if (formatted.length <= 10) setter(formatted);
  };

  // 2. Open Picker (Convert String to Date Object)
  const openDatePicker = (type) => {
    const currentValue = type === 'dob' ? dob : jobStartDate;
    
    // Default to today
    let dateToOpen = new Date();
    
    // Try to parse existing text (DD/MM/YYYY)
    if (currentValue.length === 10) {
      const [day, month, year] = currentValue.split('/');
      // Note: MM-DD-YYYY is easier for JS to parse usually, or use explicit constructor
      const parsed = new Date(year, month - 1, day); 
      if (!isNaN(parsed.getTime())) {
        dateToOpen = parsed;
      }
    }

    setPickerDate(dateToOpen);
    setPickerMode(type);
  };

  // 3. Handle Picker Selection
  const onDateSelected = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setPickerMode(null);
    }
    
    if (selectedDate) {
      // Format Date object back to DD/MM/YYYY string for the INPUT
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      const dateString = `${day}/${month}/${year}`;

      if (pickerMode === 'dob') setDob(dateString);
      if (pickerMode === 'job') setJobStartDate(dateString);
      
      if (Platform.OS === 'ios') {
        setPickerMode(null);
      }
    } else {
        setPickerMode(null);
    }
  };

  const handleSave = async () => {
    // Basic Validation
    if (!fullName || !company || !jobTitle) {
      Alert.alert('Missing Info', 'Please fill in Name, Company, and Job Title.');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) throw new Error('No authenticated user found');

      // --- DATE CONVERTER HELPER ---
      // Converts "20/05/2004" -> "2004-05-20" for Supabase
      const formatForDB = (dateString) => {
        if (!dateString || dateString.length !== 10) return null;
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
      };

      const tagsArray = [tag1, tag2, tag3]
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const updates = {
        id: user.id,
        email: user.email,          
        full_name: fullName,
        company: company,
        job_title: jobTitle,
        industry: industry,
        location: location,
        linkedin_url: linkedin,
        bio: bio,
        phone_number: phone,
        batch_year: batchYear,
        
        // Use the converter here!
        dob: formatForDB(dob), 
        job_start_date: formatForDB(jobStartDate),
        
        tags: tagsArray,
        updated_at: new Date(),
        is_profile_complete: true,
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) {
        console.error('Supabase Error:', error);
        throw error;
      }
       
      router.replace('/(tabs)/home');

    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
           
          <View style={styles.header}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>Fill in your details to join the community.</Text>
          </View>

          <View style={styles.form}>
            
            {/* ... Basic Info ... */}
            <Text style={styles.sectionHeader}>Basic Info</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput style={styles.input} placeholder="Ex. Gaurang Patil" placeholderTextColor="#666" value={fullName} onChangeText={setFullName} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput style={styles.input} placeholder="+91 98765..." placeholderTextColor="#666" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            </View>

            <View style={styles.row}>
              {/* DOB FIELD WITH ICON */}
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Date of Birth</Text>
                
                <View style={styles.dateContainer}>
                    <TextInput 
                      style={styles.dateInput} 
                      placeholder="DD/MM/YYYY" 
                      placeholderTextColor="#666" 
                      keyboardType="number-pad"
                      maxLength={10}
                      value={dob} 
                      onChangeText={(text) => handleDateChange(text, setDob)} 
                    />
                    <TouchableOpacity onPress={() => openDatePicker('dob')}>
                        <Ionicons name="calendar-outline" size={20} color="#666" style={{ marginRight: 10 }} />
                    </TouchableOpacity>
                </View>

              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Location</Text>
                <TextInput style={styles.input} placeholder="City, Country" placeholderTextColor="#666" value={location} onChangeText={setLocation} />
              </View>
            </View>

            {/* ... Professional ... */}
            <Text style={styles.sectionHeader}>Professional</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Job Title *</Text>
              <TextInput style={styles.input} placeholder="Ex. Software Engineer" placeholderTextColor="#666" value={jobTitle} onChangeText={setJobTitle} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company / College *</Text>
              <TextInput style={styles.input} placeholder="Ex. Google / IIT Bombay" placeholderTextColor="#666" value={company} onChangeText={setCompany} />
            </View>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Industry</Text>
                <TextInput style={styles.input} placeholder="Ex. Fintech" placeholderTextColor="#666" value={industry} onChangeText={setIndustry} />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Batch Year</Text>
                <TextInput style={styles.input} placeholder="Ex. 2026" placeholderTextColor="#666" keyboardType="numeric" value={batchYear} onChangeText={setBatchYear} />
              </View>
            </View>

            {/* JOB START DATE WITH ICON */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Job Start Date</Text>
              <View style={styles.dateContainer}>
                  <TextInput 
                    style={styles.dateInput} 
                    placeholder="DD/MM/YYYY" 
                    placeholderTextColor="#666" 
                    keyboardType="number-pad"
                    maxLength={10}
                    value={jobStartDate} 
                    onChangeText={(text) => handleDateChange(text, setJobStartDate)} 
                  />
                  <TouchableOpacity onPress={() => openDatePicker('job')}>
                      <Ionicons name="calendar-outline" size={20} color="#666" style={{ marginRight: 10 }} />
                  </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>LinkedIn URL</Text>
              <TextInput style={styles.input} placeholder="https://linkedin.com/in/..." placeholderTextColor="#666" autoCapitalize="none" value={linkedin} onChangeText={setLinkedin} />
            </View>

            {/* ... Personal ... */}
            <Text style={styles.sectionHeader}>About You</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Top 3 Interests / Tags</Text>
              <View style={styles.row}>
                <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="Coding" placeholderTextColor="#666" value={tag1} onChangeText={setTag1} />
                <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="Hiking" placeholderTextColor="#666" value={tag2} onChangeText={setTag2} />
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Chess" placeholderTextColor="#666" value={tag3} onChangeText={setTag3} />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Tell us about yourself..." placeholderTextColor="#666" multiline numberOfLines={4} value={bio} onChangeText={setBio} />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Saving Profile...' : 'Complete Setup 🚀'}</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- INVISIBLE DATE PICKER COMPONENT --- */}
      {/* It only renders when pickerMode is set. On Android it pops up. */}
      {pickerMode && (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateSelected}
          maximumDate={new Date()} 
        />
      )}

    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 50 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#aaa' },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#FF5722', marginTop: 20, marginBottom: 10 },
  form: { gap: 15 },
  row: { flexDirection: 'row' },
  inputGroup: { gap: 6 },
  label: { color: '#ddd', fontSize: 14, fontWeight: '500' },
  
  // Standard Input
  input: { 
    backgroundColor: '#1E1E1E', 
    color: 'white', 
    padding: 14, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#333',
    fontSize: 16
  },
  
  // Container for Date Input + Icon
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#333',
  },
  // The actual text input inside the container needs no borders
  dateInput: {
    flex: 1,
    color: 'white', 
    padding: 14, 
    fontSize: 16
  },

  textArea: { height: 100, textAlignVertical: 'top' },
  button: { backgroundColor: '#fff', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});