import React, { Component } from "react";
import { Box, Flex } from "@chakra-ui/core"
import Message from "./min-component/message";
import Header from "./min-component/header";
import * as firebase from "firebase";
import {database} from "firebase/app";
// import "firebase/database";
// // import firebase from "firebase/app";
// // require('firebase/auth');
// // require('firebase/database');

class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
            user: null,
            userId: "",
            userName: "",
            usersList: [],
            roomName: "chatRoom",
            receiverDb: "",
            messages: [],
            loadingData: true
        }
    }

    UNSAFE_componentWillMount() {
        this.setState({
            user: this.props.user,
            userId: this.props.user.uid,
            userName: this.props.user.userName
        });
        if (this.state.usersList.length < 1) { this.setUsersList() }
        this.getMessageFromRoom(this.state.roomName);
    }

    setUsersList = async (users) => {
        await database()
            .ref("usersTable")
            .on('value', snapshot => {
                let usersList = [];
                snapshot.forEach(snap => {
                    usersList.push({
                        uid: snap.key,
                        name: snap.val().userName,
                        img: snap.val().profile_picture
                    })
                })
                this.setState({ usersList })
            });
    }

    getMessageFromRoom = async (roomName) => {
        this.setState({ loadingData: true })
        let rootRef = await database().ref(roomName);
        await rootRef.once('value', snapshot => {
            let messages = [];
            snapshot.forEach(snap => {
                messages.push({
                    uid: snap.val().uid,
                    time: snap.val().time,
                    name: snap.val().name,
                    msg: snap.val().text,
                    key: snap.key
                });
            });
            this.setState({ messages, loadingData: false });
        });
        await this.unsubscribeRoom(this.state.roomName);
        if (this.state.receiverDb) {
            await this.unsubscribeRoom(this.state.receiverDb);
        }
        await this.subscribeRoom(roomName);
        this.setState({ roomName: roomName });
    }

    selectUser = async (user) => {
        this.setState({ loadingData: true })
        let messages = [];
        let senderDb = `${this.state.userId}+${user.uid}`;
        let receiverDb = `${user.uid}+${this.state.userId}`;

        await database().ref(senderDb).once("value", snapshot => {
            snapshot.forEach(snap => {
                messages.push({
                    uid: snap.val().uid,
                    time: snap.val().time,
                    name: snap.val().name,
                    msg: snap.val().text,
                    key: snap.key
                })
            })
        })
        await database().ref(receiverDb).once("value", snapshot => {
            snapshot.forEach(snap => {
                messages.push({
                    uid: snap.val().uid,
                    time: snap.val().time,
                    name: snap.val().name,
                    msg: snap.val().text,
                    key: snap.key
                })
            })
            this.setState({ messages })
        })

        await this.unsubscribeRoom(this.state.roomName);
        await this.subscribeRoom(senderDb);

        if (this.state.receiverDb) {
            await this.unsubscribeRoom(this.state.receiverDb);
        }
        await this.subscribeRoom(receiverDb);

        this.setState({ roomName: senderDb, receiverDb, loadingData: false });
    }

    subscribeRoom = async (roomName) => {
        await database().ref().child(roomName).limitToLast(1).on("child_added", snap => {
            if (this.state.messages.filter(msg => msg.key === snap.key).length === 0) {
                let newMsg = {
                    uid: snap.val().uid,
                    time: snap.val().time,
                    name: snap.val().name,
                    msg: snap.val().text,
                    key: snap.key
                }
                this.setState({ messages: [...this.state.messages, newMsg] })
            }
        })
    }

    unsubscribeRoom = async (roomName) => {
        await database().ref(roomName).off();
    }

    render() {
        return (
            < React.Fragment >
                <Box h="100vh" bg="gray.100">
                    <Flex justifyContent="center">
                        <Flex
                            width={[
                                "100%",
                                "100%",
                                "100%",
                                "65%"
                            ]}
                            flexDirection="column"
                            p={[0, 0, 0, 6]}
                        >
                            <Header
                                fullName={this.state.user.fullName}
                                profile_picture={this.state.user.profile_picture}
                                logout={this.props.logout}
                            />
                            <Flex align="center" justifyContent="center">
                                {/* <UsersList
                                    userId={this.state.userId}
                                    usersList={this.state.usersList}
                                    selectUser={this.selectUser}
                                    getMessageFromRoom={this.getMessageFromRoom}
                                    loadingData={this.state.loadingData}
                                /> */}
                                <Box
                    w="30%"
                    h="80vh"
                    shadow="lg"
                    roundedBottomRight="md"
                    bg="gray.600"
                >
                <center>
                                <div style={{ padding:" 15px 15px 15px 15px"}}>
                                <br/><br/>
                                <textarea  placeholder="Type your request..."className=" form-rounded form-control rounded-20" id="exampleFormControlTextarea1" rows="10"></textarea>
                                <br/><br/>

                                <button  type="button" class="btn btn-danger">Post a Request</button>
                                <div class="form-check">
  {/* <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault"/>
  <label class="form-check-label" for="flexCheckDefault">
    Send to all Users
  </label>
  <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault"/>
  <label class="form-check-label" for="flexCheckDefault">
    Send to all Users
  </label> */}
</div>
                                </div></center>
</Box>
                                <Message
                                    userId={this.state.userId}
                                    userName={this.state.userName}
                                    usersList={this.state.usersList}
                                    roomName={this.state.roomName}
                                    loadingData={this.state.loadingData}
                                    messages={this.state.messages}
                                />
                            </Flex>
                        </Flex>
                    </Flex>
                </Box>
            </React.Fragment >
        )
    }
}

export default Home;
