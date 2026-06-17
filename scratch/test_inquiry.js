const main = async () => {
  console.log("Simulating contact form submission...");
  try {
    const response = await fetch("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Antigravity Test User",
        email: "antigravity.test@gmail.com",
        phone: "9876543210",
        message: "Hello from Antigravity! This is a test contact inquiry to verify the Resend API integration. If you receive this, the contact form integration is working perfectly.",
        type: "contact_form",
      }),
    });

    const data = await response.json();
    console.log("Response Status:", response.status);
    console.log("Response Body:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error submitting inquiry:", error);
  }
};

main();
