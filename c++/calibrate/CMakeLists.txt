## ssh root@localhost -p 41061
## Container:
## export OpenCV_DIR=/tmp/sources/build-docker/opencv-4.x
## export nlohmann_json_DIR=/tmp/sources/build-docker/json-3.11.2
## Local
## export OpenCV_DIR=/home/ejfdelgado/desarrollo/vaale/build
## export nlohmann_json_DIR=/home/ejfdelgado/desarrollo/c++/build-local/json-3.11.2
## 
## cd /tmp/sources/workspace/calibrate
## mkdir build && cd build
## cmake ../
## make -j 8
## ./solvePnP "{\"v2\": [[282, 274], [397, 227], [577, 271], [462, 318], [270, 479], [450, 523], [566, 475]], \"v3\": [[0.5, 0.5, -0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5], [0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5]]}"
## node ../../utils/shared-libs.js ./solvePnP

cmake_minimum_required(VERSION 2.8)
project( solvePnP )
find_package( OpenCV REQUIRED )
find_package(nlohmann_json 3.11.2 REQUIRED)
include_directories( ${OpenCV_INCLUDE_DIRS} )
add_executable( solvePnP solvePnP.cpp )
target_link_libraries( solvePnP ${OpenCV_LIBS} nlohmann_json::nlohmann_json)