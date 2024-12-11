import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set, get, update, remove, push } from "firebase/database";
import { app } from '../Firebase';

export default function FirebaseDataBase() {
    const database = getDatabase(app);
    const [userList, setUserList] = useState([]);
    const [currentUser, setCurrentUser] = useState({ username: '', email: '', id: null }); // Added 'id' for update reference

    useEffect(() => {
        fetchUserList();
    }, []);

    function createUser() {
        if (currentUser.id) {
            updateUser(currentUser.id);
            return;
        }
    
        // Validate input fields
        if (!currentUser.username.trim() || !currentUser.email.trim()) {
            alert("Both username and email are required!");
            return;
        }
    
        const newUserRef = push(ref(database, 'users'));
        set(newUserRef, {
            username: currentUser.username,
            email: currentUser.email,
        })
            .then(() => {
                console.log("User created successfully!");
                setCurrentUser({ username: '', email: '', id: null });
                fetchUserList();
            })
            .catch((error) => {
                console.error("Error creating user:", error);
            });
    }

    function fetchUserList() {
        get(ref(database, 'users'))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const formattedData = Object.entries(data).map(([id, value]) => ({
                        id,
                        ...value,
                    }));
                    setUserList(formattedData);
                } else {
                    setUserList([]);
                }
            })
            .catch((error) => {
                console.error("Error fetching users:", error);
            });
    }

    function updateUser(userId) {
        update(ref(database, `users/${userId}`), {
            username: currentUser.username,
            email: currentUser.email,
        })
            .then(() => {
                console.log("User updated successfully!");
                setCurrentUser({ username: '', email: '', id: null });
                fetchUserList();
            })
            .catch((error) => {
                console.error("Error updating user:", error);
            });
    }

    function deleteUser(userId) {
        remove(ref(database, `users/${userId}`))
            .then(() => {
                console.log("User deleted successfully!");
                fetchUserList();
            })
            .catch((error) => {
                console.error("Error deleting user:", error);
            });
    }

    function editUser(user) {
        setCurrentUser({ username: user.username, email: user.email, id: user.id });
    }

    return (
        <div>
            <h1>Firebase Database</h1>

            <div>
                <input
                    type="text"
                    placeholder="Username"
                    value={currentUser.username}
                    onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={currentUser.email}
                    onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                />
                <button onClick={createUser}>{currentUser.id ? "Update User" : "Add User"}</button>
            </div>

            <h2>User List</h2>
            <ul>
                {userList.map((user) => (
                    <li key={user.id}>
                        <p>Username: {user.username}</p>
                        <p>Email: {user.email}</p>
                        <button onClick={() => editUser(user)}>Edit</button>
                        <button onClick={() => deleteUser(user.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}