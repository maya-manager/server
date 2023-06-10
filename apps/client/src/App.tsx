import { StatusBar } from "expo-status-bar";
import React from "react";
import { Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen, LoginScreen, SignupScreen } from "./screens";

type RootStackParamList = {
	Home: undefined;
	Login: undefined;
	Signup: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
	return (
		<NavigationContainer>
			<Stack.Navigator>
				<Stack.Screen name="Home" component={HomeScreen} />
				<Stack.Screen name="Signup" component={SignupScreen} />
				<Stack.Screen name="Login" component={LoginScreen} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}
