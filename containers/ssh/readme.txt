sudo docker build --platform linux/x86_64 -t ejfdelgado/calibrate:v0.1 .

sudo docker run --platform linux/x86_64 -a STDERR -a STDOUT -i --rm --name calibrate -p 80:8080 -p 41061:22 ejfdelgado/calibrate:v0.1

sudo docker ps
sudo docker stop 102f4a4719a7

docker container attach calibrate

ssh root@localhost -p 41061
//use password root