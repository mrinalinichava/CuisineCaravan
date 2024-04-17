# verify existence of necessary env vars
if [ -z "$DBLINK" ]; then
  echo "Missing environment variable 'DBLINK'. It should contain a valid mongodb database url with proper auth."
  exit 1
fi

if [ -z "$PORT" ]; then
  echo "Missing environment variable 'PORT'. It should contain a valid port number to run the server on."
  exit 1
fi

if [ -z "$JWT_SECRET" ]; then
  echo "Missing environment variable 'JWT_SECRET'. It should contain a valid secret string that'll act as JSONWebToken secret."
  exit 1
fi

# run the server
cd catering_backend
npm run start

