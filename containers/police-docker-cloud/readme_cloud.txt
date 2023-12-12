
v1.8 es con node funcionando con el proyecto
v1.81 con el workdir

v1.9 es sin nodejs ni npm
v1.10 es con docker
v1.11 es con docker compose
v1.12 puerto 8083 abierto
v1.13 privilegios de su
v1.14 ultimo

// Se construye una imagen Docker a partir de el archivo Dockerfile
docker build -t ejfdelgado/policiavr:v1.0 .

// Se verifica que la imagen se creó
docker images
// Se borra si es necesario
docker rmi -f ejfdelgado/policiavr:v1.7

// Se lanza la imagen
docker volume create policiavr_volume
docker run -p 2222:22 -p 8081:8081 --rm -it ejfdelgado/policiavr:v1.82
docker run -p 2222:22 -p 8081:8081 -p 8083:8083 --rm -it ejfdelgado/policiavr:v1.14

docker tag ejfdelgado/policiavr:v1.82 gcr.io/ejfexperiments/policiavr:v1.82
gcloud auth login
gcloud auth activate-service-account dev-600@ejfexperiments.iam.gserviceaccount.com --key-file=/home/ejfdelgado/desarrollo/ejflab/llaves/ejfexperiments-f1c7c49b937c.json
docker push gcr.io/ejfexperiments/policiavr:v1.82

docker ps
docker stop 203aaf7da182

ssh root@localhost -p 2222

// Se actualiza una nueva versión
docker ps
docker commit -m "docker-compose installed" -p 76c4e51136e2  ejfdelgado/policiavr:v1.14

docker commit --change "EXPOSE 8081" 832921e27f27 ejfdelgado/policiavr:v1.6
docker commit --change "EXPOSE 8083" 1e59521fe592 ejfdelgado/policiavr:v1.12


docker commit --change "WORKDIR /root/desarrollo/ejflab" cfb63fc5b27e ejfdelgado/policiavr:v1.81
docker commit --change='CMD echo /usr/sbin/sshd -D;npm run start' d3673e2c49ea ejfdelgado/policiavr:v1.82
