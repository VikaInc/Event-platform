// import React, { useEffect, useState } from 'react';
// import { db } from './services/firebase';
// import { collection, getDocs } from 'firebase/firestore';

// function TestFirebase() {
//   const [events, setEvents] = useState([]);

//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, 'events'));
//         const eventsData = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
//         setEvents(eventsData);
//         console.log('🔥 Firebase работает!', eventsData);
//       } catch (error) {
//         console.error('Ошибка:', error);
//       }
//     };

//     fetchEvents();
//   }, []);

//   return (
//     <div>
//       <h1> Firebase подключен!:р </h1>
//       <p>Найдено мероприятий: {events.length}</p>
//       <ul>
//         {events.map(event => (
//           <li key={event.id}>{event.title} - {event.price} сум</li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default TestFirebase;