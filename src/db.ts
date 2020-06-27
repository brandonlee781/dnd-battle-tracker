import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import store from '@/store'

const firebaseConfig = {
  apiKey: 'AIzaSyBa1-24_XR4RAauMkTUmJABU_LNNkFVp6Q',
  authDomain: 'dnd-battle-tracker.firebaseapp.com',
  databaseURL: 'https://dnd-battle-tracker.firebaseio.com',
  projectId: 'dnd-battle-tracker',
  storageBucket: 'dnd-battle-tracker.appspot.com',
  messagingSenderId: '603648166668',
  appId: '1:603648166668:web:00dd51e23503c03c7d5729',
}

// Get a Firestore instance
export const fb = firebase.initializeApp(firebaseConfig)
export const db = fb.firestore()

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    store.commit('SET_USER', { user: user.email })
  }
})

// Export types that exists in Firestore
// This is not always necessary, but it's used in other examples
const { Timestamp, GeoPoint } = firebase.firestore
export { Timestamp, GeoPoint, firebase }
