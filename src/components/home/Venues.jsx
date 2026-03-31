// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { db } from '../../services/firebase';
// import { collection, getDocs } from 'firebase/firestore';

// const Venues = () => {
//   const [venues, setVenues] = useState([]);

//   useEffect(() => {
//     const loadVenues = async () => {
//       const snapshot = await getDocs(collection(db, 'venues'));
//       setVenues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//     };
//     loadVenues();
//   }, []);

//   return (
//     <section className="venues">
//       <div className="section-header">
//         <h2>Заведения</h2>
//         <Link to="/venues" className="view-all">Смотреть все →</Link>
//       </div>
//       <div className="venues-grid">
//         {venues.map(venue => (
//           <div key={venue.id} className="venue-card">
//             <h3>{venue.name} <span>{'★'.repeat(venue.rating || 5)}</span></h3>
//             <p>{venue.description}</p>
//             <small>{venue.address}</small>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// export default Venues;