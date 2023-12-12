
// Se construye una imagen Docker a partir de el archivo Dockerfile
docker build -t ejfdelgado/policiavr:v1.0 .

// Se verifica que la imagen se creó
docker images
// Se borra si es necesario
docker rmi -f ejfdelgado/policiavr:v1.1

// Se lanza la imagen
docker run -p 2222:22 --rm -it ejfdelgado/policiavr:v1.2

docker ps
docker stop 2c0fe7178c74

ssh root@localhost -p 2222

// Se actualiza una nueva versión
docker ps
docker commit -m "ejf project added" -p 2c0fe7178c74  ejfdelgado/policiavr:v1.2

8081

docker commit --change "ENV PORT=3000" c3f279d17e0a   ejfdelgado/policiavr:v1.3
docker commit --change "EXPOSE 3000" c3f279d17e0a   ejfdelgado/policiavr:v1.3

