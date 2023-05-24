/**
 * This program takes a set of corresponding 2D and 3D points and finds the transformation matrix
 * that best brings the 3D points to their corresponding 2D points.
 */
#include "solvePnP.h"
#include "utils.h"

#include <iostream>
#include <string>

int main(int argc, char *argv[])
{
    std::string argument = argv[1];
    json data = json::parse(argument);
    std::vector<Data2D> ref2D = json2Data2DVector(&(data["v2"]));
    std::vector<Data3D> ref3D = json2Data3DVector(&(data["v3"]));;
    computeCamera(&data, ref2D, ref3D);
    std::string s = data.dump();
    std::cout << s << std::endl;
    return 0;
}
