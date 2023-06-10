import { View, Text, TouchableOpacity, SafeAreaView, Image, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import React, { useLayoutEffect } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Signup: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const HomeScreen = () => {

  const navigation = useNavigation();

  useLayoutEffect(()=> {
    navigation.setOptions({
        headerShown: false,
    })
  }, [])

  return (
    <SafeAreaView className='bg-white w-screen h-screen items-center'>
      <View className='w-auto h-auto mt-10'>
        <Image source={require('../../assets/illustrations/get-started.jpg')} className='w-[80vw] h-[80vw]'/>
      </View>
      <View className=''>
        <Text className='text-center text-[22px] mt-8'>Easily manage your money {"\n"}with <Text className='text-primary'>Maya</Text></Text>
        <Text className='text-[16px] tracking-widest mt-6'>
          Join us now and let us take care {"\n"}of all your stress to manage your {"\n"}money
        </Text>
      </View>
      <TouchableOpacity className='py-4 px-20 bg-primary rounded mt-20' onPress={() => navigation.navigate('Signup')}>
        <Text className='text-white'>Join Us</Text>
      </TouchableOpacity>
      <View className='mt-8'>
      <Text>
        <Text onPress={() => navigation.navigate('Login')} className='text-primary underline'>Or login </Text>
        if you already have an account
        </Text>
      </View>
 
    </SafeAreaView>
  )
}

export default HomeScreen