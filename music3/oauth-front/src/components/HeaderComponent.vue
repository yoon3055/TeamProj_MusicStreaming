<template>
    <v-app-bar app dark>
        <v-container>
            <v-row align="center">
                <v-col class="d-flex justify-end">
                    <v-btn v-if="!isLogin" :to="{path: '/member/create'}"> 회원가입</v-btn>
                    <v-btn v-if="!isLogin" :to="{path: '/member/login'}">로그인</v-btn>
                    <v-btn v-if="isLogin" @click="doLogout()">로그아웃</v-btn>
                </v-col>
            </v-row>
        </v-container>
    </v-app-bar>

</template>

<script>
import Cookies from 'js-cookie';

export default{
    data(){
        return {
            isLogin: false,
        }
    },
    created(){
        
        // const token = new URL(window.location.href).searchParams.get("token");

        const token = Cookies.get("token");
        console.log(token);
        if(token){
            localStorage.setItem("token", token);
            Cookies.remove("token");
            window.location.href="/";
        }

        if(localStorage.getItem("token")){
            this.isLogin = true;
        }
    },
    methods:{
        doLogout(){
            localStorage.clear();
            window.location.reload();
        }
    }
}
</script>
