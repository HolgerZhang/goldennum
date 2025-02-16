var app = new Vue({
    delimiters: ['[[', ']]'],
    el: '#app',
    data: {
        inputRoomId: getSavedRoomId(),
        changeRoomErrorMessage: "",

        submitInput1: 0,
        submitInput2: 0,
        signedIn: false,
        userId: null,
        userName: "123",
        userPassword: "",
        userScore: 0,
        errorMessages: [],

        signInModalUserId: 0,
        signInModalPassword: "",
        signInModalErrorMessage: "",
        signInModalSuccessMessage: "",

        signUpModalRoomId: "",
        signUpModalUserName: "",
        signUpModalPassword1: "",
        signUpModalPassword2: "",
        signUpModalErrorMessage: "",
        signUpModalSuccessMessage: "",
    },
    methods: {
        updateRoomId(id) {
            if (id == null) {
                id = this.inputRoomId;
            }
            getRoomInfo(id).then(data => {
                if (!setSavedRoomId(id)) {
                    return;
                }
                this.inputRoomId = id;
                this.$refs.panelDashboard.updateRoomId(id);
                this.changeRoomErrorMessage = "";
            }).catch(error => {
                this.changeRoomErrorMessage = CHANGE_ROOM_ERROR_MESSAGE_1 + `${id}` + CHANGE_ROOM_ERROR_MESSAGE_2;
                setTimeout(() => this.changeRoomErrorMessage = "", 3000)
            });
        },
        submitValidator(num) {
            if (num <= 0 || num >= 100) {
                return false;
            }
            return true;
        },
        submitUserInput() {
            let s1 = parseFloat(this.submitInput1);
            let s2 = parseFloat(this.submitInput2);
            if (!this.submitValidator(s1) || !this.submitValidator(s2)) {
                this.errorMessages = [SUBMIT_ERROR_MESSAGE];
                setTimeout(() => this.errorMessages = [], 5000)
                return;
            }
            postUserSubmit(this.userId, this.userPassword, this.submitInput1, this.submitInput2)
                .then(data => {
                    this.errorMessages = [SUBMIT_SUCCESS_MESSAGE];
                    setTimeout(() => this.errorMessages = [], 1000)
                })
                .catch(error => {
                    this.errorMessages = [error.error];
                    if (error.data) {
                        error.data.then(data => this.errorMessages.push(data));
                    }
                    setTimeout(() => this.errorMessages = [], 5000)
                });
        },
        modalSignIn() {
            if (this.signInModalPassword.length < 8) {
                this.signInModalErrorMessage = SIGN_IN_ERROR_MESSAGE_PASSWORD_LENGTH;
                return;
            }
            putUserAuth(
                this.signInModalUserId,
                this.signInModalPassword
            ).then(data => {
                this.signInModalErrorMessage = "";
                this.signInModalSuccessMessage = SIGN_IN_SUCCESS_MESSAGE
                setTimeout(
                    () => {
                        $("#userSignInModal").modal('hide');
                        this.signInModalSuccessMessage = "";
                    }, 1000
                );
                this.setSignedIn(true);
                this.setUserId(this.signInModalUserId);
                this.setUserPassword(this.signInModalPassword);
                this.updateRoomId(data.RoomID);
            }).catch(error => {
                this.signInModalErrorMessage = error.error;
                if (error.data) {
                    error.data.then(data => this.signInModalErrorMessage += " " + data);
                }
            })
        },
        modalSignUp() {
            if (this.signUpModalPassword1 != this.signUpModalPassword2) {
                this.signUpModalErrorMessage = SIGN_UP_ERROR_MESSAGE_PASSWORD_TWICE;
                return;
            }
            if (this.signUpModalPassword1.length < 8) {
                this.signUpModalErrorMessage = SIGN_UP_ERROR_MESSAGE_PASSWORD_LENGTH;
                return;
            }
            if (this.signUpModalUserName.length < 1) {
                this.signUpModalErrorMessage = SIGN_UP_ERROR_MESSAGE_USERNAME_LENGTH;
                return;
            }
            postUserCreate(
                this.signUpModalRoomId,
                this.signUpModalUserName,
                this.signUpModalPassword1
            ).then(data => {
                this.signUpModalErrorMessage = "";
                this.signUpModalSuccessMessage = SIGN_UP_SUCCESS_MESSAGE;
                setTimeout(
                    () => {
                        $("#userSignUpModal").modal('hide');
                        this.signInModalSuccessMessage = "";
                    }, 1000
                );
                this.userName = this.signUpModalUserName;
                this.setSignedIn(true);
                this.setUserId(data.ID);
                this.setUserPassword(this.signUpModalPassword1);
                this.updateRoomId(data.RoomID);
            }).catch(error => {
                this.signUpModalErrorMessage = error.error;
                if (error.data) {
                    error.data.then(data => this.signUpModalErrorMessage += " " + data);
                }
            })
        },
        signOut() {
            this.setSignedIn(false);
        },
        setSignedIn(data) {
            localStorage.setItem(KEY_SAVED_SIGNED_IN, data);
            this.signedIn = data;
        },
        setUserId(data) {
            localStorage.setItem(KEY_SAVED_USER_ID, data);
            this.userId = parseInt(data);
        },
        setUserPassword(data) {
            setSavedToken(data);
            this.userPassword = data;
        },
        fillSignInModal() {
            this.signInModalErrorMessage = "";
            this.signInModalSuccessMessage = "";
            this.signInModalUserId = localStorage.getItem(KEY_SAVED_USER_ID);
            this.signInModalPassword = getSavedToken();
        },
        fillSignUpModal() {
            this.signUpModalErrorMessage = "";
            this.signUpModalSuccessMessage = "";
            this.signUpModalRoomId = this.inputRoomId;
        },
        refreshUserScore() {
            this.userScore = parseInt(localStorage.getItem(KEY_USER_SCORE_PREFIX + this.userId));
            setTimeout(this.refreshUserScore, 1000);
        },
    },
    mounted: function () {
        if (localStorage.getItem(KEY_SAVED_SIGNED_IN) == "true") {
            this.signedIn = true;
            this.userId = localStorage.getItem(KEY_SAVED_USER_ID);
            this.userPassword = getSavedToken();
            getUserInfo(this.userId).then(data => {
                this.userName = data.Name;
                this.userScore = data.Score;
                this.updateRoomId(data.RoomID);
            });
        } else {
            this.updateRoomId(localStorage.getItem(KEY_SAVED_ROOM_ID));
        }
        this.refreshUserScore();
    },
})