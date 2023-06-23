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
    try
    {
        std::vector<Data2D> size = json2Data2DVector(&(data["size"]));
        std::vector<Data2D> focal = json2Data2DVector(&(data["focal"]));
        std::vector<Data2D> ref2D = json2Data2DVector(&(data["v2"]));
        std::vector<Data3D> ref3D = json2Data3DVector(&(data["v3"]));

        computeCamera(&data, ref2D, ref3D, size, focal);
    }
    catch (cv::Exception &e)
    {
        const char *err_msg = e.what();
        data["error"] = err_msg;
    }
    std::string s = data.dump();
    std::cout << s << std::endl;
    return 0;
}
