# install dependencies for the frontend, and build it
cd catering_frontend
npm install
npm run build
cd ..

# install dependencies for the backend
cd catering_backend
npm install
cd ..

# copy the build directory
cp -r ./catering_frontend/build ./catering_backend/
