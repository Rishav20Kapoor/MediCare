// Uses Node's global fetch (Node 18+). No external deps required.

async function run() {
  try {
    const res = await fetch('http://localhost:4000/api/doctors/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dr1@gmail.com', password: 'newPassword123' }),
    });
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log('BODY', text);
  } catch (err) {
    console.error('ERROR', err?.message || err);
  }
}

run();
