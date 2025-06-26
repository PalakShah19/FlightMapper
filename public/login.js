"use strict";

document.addEventListener("DOMContentLoaded", () => {
	const loginBtn = document.getElementById("login-btn");
	
	loginBtn.addEventListener("click", async () => {
		
		const email = document.getElementById("email").value.trim();
		const password = document.getElementById("password").value.trim();
		const errorElement = document.getElementById("error");
		
		// Email & password regex validation
		
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
		
		if (!emailRegex.test(email)){
			errorElement.innerText = "Invalid email format";
			return;
			
		}
		
		if(!passwordRegex.test(password)){
			errorElement.innerText = "Password must be at least 8 characters with letters and numbers.";
			return;
			
			
		}
		
		const response = await fetch("/login", {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({ email, password })
			
		});
		
		if (response.ok) {
			
			window.location.href = "/index.html";
			
		}else {
			
			const data = await response.json();
			errorElement.innerText = data.error || "login failed";
			
			
		}
		
	});
});
