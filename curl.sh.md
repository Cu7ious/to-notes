curl -X POST http://localhost:3000/auth/register \
 -H "Content-Type: application/json" \
 -d '{"username": "user", "pass": "pass"}'

curl -X POST http://localhost:3000/auth/login \
 -H "Content-Type: application/json" \
 -d '{"username": "user", "pass": "pass"}'
