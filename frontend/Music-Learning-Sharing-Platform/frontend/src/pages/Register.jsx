import { useState } from "react";
import { api } from "../api";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", gender: "", profilePictureUrl: ""
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/users", form);
    alert("Registered!");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8 space-y-4">
      {["firstName", "lastName", "email", "password", "gender", "profilePictureUrl"].map(field => (
        <input key={field} type="text" name={field} placeholder={field}
          onChange={handleChange} className="w-full p-2 border" />
      ))}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2">Register</button>
    </form>
  );
}
