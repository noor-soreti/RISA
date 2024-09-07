import { useState } from "react";
import { View, Text, Pressable, TextInput, Button, KeyboardAvoidingView, Image, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native";
import InputBox from "@/components/InputBox";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db, storage } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { doc, setDoc } from "firebase/firestore";
import * as ImagePicker from 'expo-image-picker';
import upload from "@/helperFunction/upload";
import { ref } from "firebase/storage";
import { defaultStyles } from "@/constants/Styles";

export default function Register({navigation}: any) { 
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [image, setImage] = useState<string | null>(null);
  const [warn, setWarn] = useState('')
  const [ loading, setLoading ] = useState(false)

  const isButtonDisabled = !email || password.length < 6 || confirmPassword.length < 6 || !name

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      console.log(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    setLoading(true)
    if (password === confirmPassword) {            
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const imageUrl = await upload(image)
        await setDoc(doc(db, "users", userCredential.user.uid), {
          displayName: name,
          email,
          avatar: imageUrl,
          status: 'Feeling Happy',
          friends: [],
          id: userCredential.user.uid})
        await setDoc(doc(db, "userChats", userCredential.user.uid), {
          chats: []
        })
        await setDoc(doc(db, "userCalls", userCredential.user.uid), {
          calls: []
        })
      } catch (e) {
        console.log(e.message);
        setWarn(e.message)
      } finally {
      }
    } else {
      setWarn("Passwords must match")
    }
    setLoading(false)
  }

    return (
        <View style={styles.container}>
            {/* <Text style={{color: '#7CA4FC', fontWeight: '700', fontSize: 17}}>Enter your phone number</Text> */}
            {/* <View style={styles.inputArea}>
                <Pressable style={styles.dropdown}>
                    <Text style={styles.dropdownText}>+251</Text>
                </Pressable>
                <TextInput style={styles.input} value={email} onChangeText={setEmail}/>
            </View> */}

          <TouchableOpacity style={{alignSelf: 'flex-start', padding: 5}} onPress={() => navigation.goBack()}>
            <Ionicons name="close-outline" size={28} />
          </TouchableOpacity>

          <Button title="Pick an image from camera roll" onPress={pickImage} />
          { image && <Image source={{ uri: image}} style={styles.image} />}
          {!image && <Image 
              source={require('../assets/images/user-profile.png')}
              style={styles.image}
          />}


          <View style={{marginBottom: 5}}>
            <KeyboardAvoidingView behavior="padding"> 
              <InputBox placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
              <InputBox placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={true}/>
              <InputBox placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={true}/>
              <InputBox placeholder="Full Name" value={name} onChangeText={setName} autoCapitalize="words"/>
            </KeyboardAvoidingView>
          </View>

          { warn && <View><Text style={{color: 'red'}}>{warn}</Text></View>}
            
          <TouchableOpacity onPress={() => handleRegister() } style={[defaultStyles.btn, styles.btnColour, isButtonDisabled && styles.disabled]} disabled={isButtonDisabled}>
            <Text style={styles.text}>{ loading ? "Loading.." : "NEXT"}</Text>
          </TouchableOpacity>

          {/* <ButtonComponent text='Next' screenName='verification' disabled={isButtonDisabled}/> */}

          <View  style={{alignItems:'center'}}>
              <Text style={{marginTop: 20, color: 'grey'}}>
                  We'll email you a 5-digit code to verify your email
              </Text>
              <Text style={{marginTop: 20, color: 'grey'}}>
                  Don't have a local number?
              </Text>
          </View>
        </View>
    )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFF7F8',
    gap: 15,
    padding: 20,
  },
  image: {
    width: 90,
    height: 90,
    borderWidth: 2,
    borderColor: '#FFD1DC',
    borderRadius: 45,
    marginTop: 20,
  },
  inputArea: {
    flexDirection: 'row',
    width: 320,
    marginTop: 20,
    backgroundColor: '#FFF0F5',
    borderRadius: 15,
    padding: 10,
    shadowColor: '#FFC1CC',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  dropdown: {
    width: 100,
    height: 40,
    backgroundColor: '#7CA4FC',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginRight: 10,
  },
  dropdownText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  input: {
    height: 40,
    width: 200,
    padding: 10,
    borderColor: '#FFD1DC',
    color: '#7b8d93',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#FFF0F5',
    shadowColor: '#FFC1CC',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  invalidPhoneNumber: {
    color: 'red',
    paddingBottom: 10,
    fontSize: 14,
  },
  btnColour: {
    backgroundColor: '#7CA4FC',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Arial',
  },
  disabled: {
    backgroundColor: '#e7e7e7',
  },
});
