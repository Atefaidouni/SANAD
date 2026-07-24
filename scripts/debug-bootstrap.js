const login = async () => {
  const res = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student1@sanad.dz', password: 'Student@123' }),
  });
  const json = await res.json().catch(() => null);
  console.log('login status', res.status);
  console.log('login body', JSON.stringify(json ? { session: json.session, coursesCount: json.snapshot?.courses?.length } : json, null, 2));
  const setCookie = res.headers.get('set-cookie');
  console.log('set-cookie present', Boolean(setCookie));
  if (setCookie) {
    const cookieHeader = setCookie.split(',').map((c) => c.split(';')[0]).join('; ');
    const boot = await fetch('http://localhost:3001/api/bootstrap', {
      headers: { Cookie: cookieHeader },
    });
    const bootJson = await boot.json().catch(() => null);
    console.log('bootstrap status', boot.status);
    console.log('bootstrap body', JSON.stringify(bootJson ? { session: bootJson.session, coursesCount: bootJson.snapshot?.courses?.length } : bootJson, null, 2));
  }
};

login().catch((err) => {
  console.error(err);
  process.exit(1);
});