// "use client"
// import Image from "next/image";
// import { useState } from "react";
// import { submitName } from "./actions";

// export default function Home() {

//   const [name, setName] = useState("");

//   return (
//     <>
//       <form 
//         action={submitName}>
//         <label htmlFor="name">Enter your name:</label>
//         <input
//           type="text"
//           id="name"
//           name="name"
//           value={name}
//           onChange={(e) => { setName(e.target.value) }}
//           className="border-2"
//           required
//         />
//         <button type="submit">Submit</button>
//       </form>


//     </>
//   );
// }

import Image from "next/image";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import GamesSection from "@/components/GamesSection";
import Leaderboard from "@/components/Leaderboard";
import PrizesSection from "@/components/PrizesSection";
import Timeline from "@/components/Timeline";
import RulesSection from "@/components/RulesSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <GamesSection />
      <Leaderboard /> 
      <PrizesSection />
      <Timeline />
      <RulesSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
