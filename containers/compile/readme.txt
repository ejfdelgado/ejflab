
Para compilar dentro de la instacia Docker:
1. Levantar la instancia:
sudo docker run --platform linux/x86_64 -v /home/ejfdelgado/desarrollo/c++:/tmp/sources -v /home/ejfdelgado/desarrollo/ejflab/c++:/tmp/sources/workspace --name compile -p 41061:22 ejfdelgado/compile:v0.2
2. Si sale error docker: Error response from daemon: Conflict.
sudo docker rm ad4de59036c750e11c2bc461e0faffa32ec27cf87bb56ba70f63a96bf9d084aa
3. La instancia se queda corriendo, se debe conectar
ssh root@localhost -p 41061
//use password root
4.
export OpenCV_DIR=/tmp/sources/build-docker/opencv-4.x
export nlohmann_json_DIR=/tmp/sources/build-docker/json-3.11.2
cd /tmp/sources/workspace/calibrate
rm -R build && mkdir build && cd build
cmake ../
make -j 8
node ../../utils/shared-libs.js ./solvePnP
5. Copiar el bin a ejflab/bin-docker
6. Detener la instancia
sudo docker ps
sudo docker stop 37011c753187


sudo docker build --platform linux/x86_64 -t ejfdelgado/compile:v0.1 .
sudo docker run --platform linux/x86_64 -a STDERR -a STDOUT -i --rm --name compile -p 41061:22 ejfdelgado/compile:v0.2
sudo docker commit 0a47e0269e5c  ejfdelgado/compile:v0.2
