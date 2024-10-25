import React from "react";
import { useState } from "react";
import { StyleSheet,View,Text, Button, SafeAreaView } from "react-native";
import LoginBtn from "./LoginButton";
import SignUp from "./SignUpButton";
import FetchThingSpeakData from "./FetchData";
import ChartComponent,{ processData } from "./ShowChart";
// import MessegeSender from "./MessegeSender";
// import Prediction from "./Prediction";
function RegisterScreen()
{
    
    return(


        /*
            <SafeAreaView style={styles.container}>
                <MessegeSender />
            </SafeAreaView>
    */






        


        <View style={styles.container}>
            <Text style={styles.registerTxt}>Energy Consumption Graph</Text>
           {/* <LoginBtn/> */}
           {/* <FetchThingSpeakData />   
           e.g  <FetchThingSpeakData /> --> function for fetching data and display to the console */}
           {/* <SignUp /> */}
           
           <ChartComponent />
            {/* <Prediction /> */}
            
        </View>

    );
}

// message-->

/*
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',

    }
});
*/



const styles = StyleSheet.create({
    container : {
        height : "100%",
        backgroundColor : "white",
    },
    logBtn : {
        backgroundColor : "white",
        width : 20,
    },
    registerTxt: {
        fontWeight :"bold",
        fontSize : 20,
        color : "#023080",
        textAlign : "center",
        marginTop : 100,

    },

})

export default RegisterScreen;


 