import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const API_URL = 'http://192.168.1.2:5000';

export default function PostScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('other');
  const [condition, setCondition] = useState('good');
  const [location, setLocation] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 3,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages(result.assets);
    }
  };

  const handlePost = async () => {
    if (!title || !description || !price || !location || !sellerPhone) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login first');
        router.push('/login');
        return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('condition', condition);
      formData.append('location', location);
      formData.append('sellerPhone', sellerPhone);

      images.forEach((img, index) => {
        formData.append('images', {
          uri: img.uri,
          type: 'image/jpeg',
          name: `image_${index}.jpg`,
        } as any);
      });

      const res = await fetch(`${API_URL}/api/listings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'Listing posted!');
        router.push('/');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Post Furniture</Text>

      <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} multiline numberOfLines={3} />
      <TextInput style={styles.input} placeholder="Price (Rs.)" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
      <TextInput style={styles.input} placeholder="Phone Number" value={sellerPhone} onChangeText={setSellerPhone} keyboardType="phone-pad" />

      <Text style={styles.label}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {['sofa', 'bed', 'table', 'chair', 'wardrobe', 'other'].map(cat => (
          <TouchableOpacity key={cat} style={[styles.chip, category === cat && styles.chipActive]} onPress={() => setCategory(cat)}>
            <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Condition</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {['new', 'like-new', 'good', 'fair'].map(con => (
          <TouchableOpacity key={con} style={[styles.chip, condition === con && styles.chipActive]} onPress={() => setCondition(con)}>
            <Text style={[styles.chipText, condition === con && styles.chipTextActive]}>{con}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.imageBtn} onPress={pickImages}>
        <Text style={styles.imageBtnText}>📷 Add Photos (max 3)</Text>
      </TouchableOpacity>

      <ScrollView horizontal style={styles.imageRow}>
        {images.map((img, index) => (
          <Image key={index} source={{ uri: img.uri }} style={styles.previewImage} />
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={handlePost}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Post Listing</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginTop: 40, marginBottom: 20 },
  input: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 12, fontSize: 16 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  chipRow: { marginBottom: 12 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: '#ddd' },
  chipActive: { backgroundColor: '#2ecc71', borderColor: '#2ecc71' },
  chipText: { color: '#666' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  imageBtn: { backgroundColor: '#fff', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed' },
  imageBtnText: { color: '#666', fontSize: 16 },
  imageRow: { marginBottom: 12 },
  previewImage: { width: 100, height: 100, borderRadius: 10, marginRight: 8 },
  button: { backgroundColor: '#2ecc71', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 8, marginBottom: 40 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});