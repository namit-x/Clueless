"use client"
import Image from "next/image";
import { useState } from "react";
import { submitName } from "./actions";

export default function Home() {

  const [name, setName] = useState("");

  return (
    <>
      <form 
        action={submitName}>
        <label htmlFor="name">Enter your name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => { setName(e.target.value) }}
          className="border-2"
          required
        />
        <button type="submit">Submit</button>
      </form>
    <p>so this is my home page you are saying?</p>
    </>
  );
}
