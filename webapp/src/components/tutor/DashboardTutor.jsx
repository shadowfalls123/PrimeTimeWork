// import React, { useState } from "react";
// import { Swiss } from "tournament-pairings";

// const ChessTournament = () => {
//   const [players, setPlayers] = useState([]);
//   const [playerName, setPlayerName] = useState("");
//   const [playerRating, setPlayerRating] = useState("");
//   const [pairings, setPairings] = useState([]);
//   const [round, setRound] = useState(1);
//   const [isTournamentStarted, setIsTournamentStarted] = useState(false);

//   // Add a player
//   const addPlayer = () => {
//     if (playerName && playerRating) {
//       setPlayers([
//         ...players,
//         { id: players.length + 1, name: playerName, rating: parseInt(playerRating), score: 0 },
//       ]);
//       setPlayerName("");
//       setPlayerRating("");
//     }
//   };

//   // Generate initial pairings
//   const generatePairings = () => {
//     if (players.length < 2) {
//       alert("At least 2 players are required to start the tournament.");
//       return;
//     }

//     setIsTournamentStarted(true);

//     // ✅ FIX: Pass objects, not just IDs
//     const swiss = new Swiss(players.map((p) => ({ id: p.id, score: p.score })));

//     // Generate pairings
//     const newPairings = swiss.pairings().map(([p1, p2]) => ({
//       player1: players.find((pl) => pl.id === p1.id),
//       player2: p2 ? players.find((pl) => pl.id === p2.id) : null, // Handle BYE
//     }));

//     setPairings(newPairings);
//   };

//   // Update scores and generate next round pairings
//   const updateScores = (winnerId) => {
//     const updatedPlayers = players.map((player) =>
//       player.id === winnerId ? { ...player, score: player.score + 1 } : player
//     );

//     setPlayers(updatedPlayers);
//     setRound(round + 1);

//     // ✅ FIX: Pass objects, not just IDs
//     const swiss = new Swiss(updatedPlayers.map((p) => ({ id: p.id, score: p.score })));

//     // Generate next round pairings
//     const newPairings = swiss.pairings().map(([p1, p2]) => ({
//       player1: updatedPlayers.find((pl) => pl.id === p1.id),
//       player2: p2 ? updatedPlayers.find((pl) => pl.id === p2.id) : null,
//     }));

//     setPairings(newPairings);
//   };

//   return (
//     <div>
//       <h2>Swiss Chess Tournament</h2>

//       {!isTournamentStarted ? (
//         <div>
//           <h3>Add Players</h3>
//           <input
//             type="text"
//             placeholder="Player Name"
//             value={playerName}
//             onChange={(e) => setPlayerName(e.target.value)}
//           />
//           <input
//             type="number"
//             placeholder="Rating"
//             value={playerRating}
//             onChange={(e) => setPlayerRating(e.target.value)}
//           />
//           <button onClick={addPlayer}>Add Player</button>

//           <h3>Players List</h3>
//           <ul>
//             {players.map((player) => (
//               <li key={player.id}>
//                 {player.name} (Rating: {player.rating})
//               </li>
//             ))}
//           </ul>

//           <button onClick={generatePairings}>Start Tournament</button>
//         </div>
//       ) : (
//         <div>
//           <h3>Round {round} Pairings</h3>
//           <ul>
//             {pairings.map((match, index) => (
//               <li key={index}>
//                 {match.player1.name} vs {match.player2?.name || "BYE"}
//                 <button onClick={() => updateScores(match.player1.id)}>
//                   {match.player1.name} Wins
//                 </button>
//                 {match.player2 && (
//                   <button onClick={() => updateScores(match.player2.id)}>
//                     {match.player2.name} Wins
//                   </button>
//                 )}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChessTournament;
