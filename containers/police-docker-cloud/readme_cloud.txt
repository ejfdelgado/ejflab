
// Se construye una imagen Docker a partir de el archivo Dockerfile
docker build -t ejfdelgado/policiavr:v1.0 .

// Se verifica que la imagen se creó
docker images
// Se borra si es necesario
docker rmi -f ejfdelgado/policiavr:v1.2

// Se lanza la imagen
docker run -p 2222:22 --rm -it ejfdelgado/policiavr:v1.4

docker ps
docker stop 076a60a50b66

ssh root@localhost -p 2222

// Se actualiza una nueva versión
docker ps
docker commit -m "node problem" -p 076a60a50b66  ejfdelgado/policiavr:v1.4

docker commit --change "ENV PORT=8081 && EXPOSE 8081" c3f279d17e0a   ejfdelgado/policiavr:v1.4
