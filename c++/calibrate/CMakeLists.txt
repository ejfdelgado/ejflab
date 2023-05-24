## export OpenCV_DIR=/home/ejfdelgado/desarrollo/vaale/build
## export nlohmann_json_DIR=/home/ejfdelgado/desarrollo/c++/json-3.11.2/build
## cd build
## cmake ../
## make -j 8
## ./solvePnP "{\"a\": 5}"
## node ../../utils/shared-libs.js ./solvePnP

cmake_minimum_required(VERSION 2.8)
project( solvePnP )
find_package( OpenCV REQUIRED )
find_package(nlohmann_json 3.11.2 REQUIRED)
include_directories( ${OpenCV_INCLUDE_DIRS} )
add_executable( solvePnP solvePnP.cpp )
target_link_libraries( solvePnP ${OpenCV_LIBS} nlohmann_json::nlohmann_json)