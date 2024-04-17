# verify existence of necessary env vars
if ($null -eq $env:DBLINK)       { throw "Missing environment variable 'DBLINK'. It should contain a valid mongodb database url with proper auth." }
if ($null -eq $env:PORT)         { throw "Missing environment variable 'PORT'. It should contain a valid port number to run the server on." }
if ($null -eq $env:JWT_SECRET)   { throw "Missing environment variable 'JWT_SECRET'. It should contain a valid secret string that'll act as JSONWebToken secret." }

# run the server
cd catering_backend
npm run start