
// Se construye una imagen Docker a partir de el archivo Dockerfile
docker build -t ejfdelgado/policiavr:v1.0 .

// Se verifica que la imagen se creó
docker images
// Se borra si es necesario
docker rmi -f ejfdelgado/policiavr:v1.0

// Se lanza la imagen
docker run -p 2222:22 --rm -it ejfdelgado/policiavr:v1.1

docker ps
docker stop c77b37873e84

ssh root@localhost -p 2222

docker ps
docker commit -m "install git" -p c77b37873e84  ejfdelgado/policiavr:v1.1
