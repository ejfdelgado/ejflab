export OpenCV_DIR=/home/ejfdelgado/desarrollo/vaale/build
cd build
cmake ../
make -j 8
./solvePnP
node ../../utils/shared-libs.js ./solvePnP