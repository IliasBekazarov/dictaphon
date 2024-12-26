import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput } from 'react-native';
import { Audio } from 'expo-av';

export default function App() {
  const [recording, setRecording] = useState(null);
  const [audioList, setAudioList] = useState([]); // Аудио тизмеси
  const [audioName, setAudioName] = useState(''); // Жаңы аудио үчүн аталыш

  // Аудио жаздырууну баштоо
  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        setRecording(recording);
        console.log('Recording started');
      } else {
        alert('Permission to access microphone is required!');
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  // Аудио жаздырууну токтотуу жана тизмеге кошуу
  async function stopRecording() {
    try {
      console.log('Recording stopped');
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      const newAudio = {
        id: Date.now().toString(),
        uri: uri,
        name: audioName || `Audio ${new Date().toLocaleTimeString()}`,
      };

      setAudioList((prevList) => [...prevList, newAudio]);
      setRecording(null);
      setAudioName('');
      console.log('Recording saved at', uri);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  }

  // Аудиону ойнотуу
  async function playRecording(uri) {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
      console.log('Playing audio:', uri);
    } catch (err) {
      console.error('Failed to play recording', err);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Диктофон </Text>

      {/* Жазуу үчүн аталыш киргизүү */}
      <TextInput
        style={styles.input}
        placeholder="Name of audeo"
        placeholderTextColor="#aaa"
        value={audioName}
        onChangeText={(text) => setAudioName(text)}
      />

      {/* Жаздыруу/Токтотуу */}
      <TouchableOpacity
        style={styles.button}
        onPress={recording ? stopRecording : startRecording}
      >
        <Text style={styles.buttonText}>
          {recording ? 'stop' : 'start'}
        </Text>
      </TouchableOpacity>

      {/* Аудио Todo List */}
      <FlatList
        data={audioList}
        keyExtractor={(item) => item.id}
        style={styles.audioList}
        renderItem={({ item }) => (
          <View style={styles.audioItem}>
            <Text style={styles.audioName}>{item.name}</Text>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => playRecording(item.uri)}
            >
              <Text style={styles.playButtonText}>Pley</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No audeo.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#333',
    color: 'white',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1db954',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  audioList: {
    marginTop: 20,
  },
  audioItem: {
    backgroundColor: '#444',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  audioName: {
    color: 'white',
    fontSize: 16,
  },
  playButton: {
    backgroundColor: '#1db954',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  playButtonText: {
    color: 'white',
    fontSize: 14,
  },
  emptyText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
});