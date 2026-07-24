async function main() {
  const loginRes = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student1@sanad.dz', password: 'Student@123' }),
  });
  console.log('login status', loginRes.status);
  console.log('login headers', Object.fromEntries(loginRes.headers.entries()));
  const loginBody = await loginRes.text();
  console.log('login body', loginBody);
  const setCookie = loginRes.headers.get('set-cookie');
  if (setCookie) {
    const cookieHeader = setCookie.split(',').map((c) => c.split(';')[0]).join('; ');
    const bootRes = await fetch('http://localhost:3001/api/bootstrap', {
      method: 'GET',
      headers: { Cookie: cookieHeader },
    });
    console.log('bootstrap status', bootRes.status);
    console.log('bootstrap body', await bootRes.text());
  } else {
    console.warn('no set-cookie header on login response');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});