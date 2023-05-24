/**
 * This program takes a set of corresponding 2D and 3D points and finds the transformation matrix
 * that best brings the 3D points to their corresponding 2D points.
 */
#ifndef __solve_pnp_h__
#define __solve_pnp_h__

#include "opencv2/core/core.hpp"
#include "opencv2/imgproc/imgproc.hpp"
#include "opencv2/calib3d/calib3d.hpp"
#include "opencv2/highgui/highgui.hpp"
#include <nlohmann/json.hpp>
using json = nlohmann::json;

#include <iostream>
#include <string>

struct Data2D
{
    double x, y;
};

struct Data3D
{
    double x, y, z;
};

std::vector<Data2D> json2Data2DVector(json *data);
std::vector<Data3D> json2Data3DVector(json *data);

json cvMat2json(cv::Mat mat);

std::vector<cv::Point2f> Generate2DPoints(std::vector<Data2D>);
std::vector<cv::Point3f> Generate3DPoints(std::vector<Data3D>);
void computeCamera(json *data, std::vector<Data2D>, std::vector<Data3D>);
std::vector<cv::Point2f> guessPoints(std::vector<Data3D>, std::vector<Data2D>, std::vector<Data3D>);

json cvMat2json(cv::Mat mat)
{
    double *input = (double *)(mat.data);
    json columnas;
    for (int i = 0; i < mat.cols; i++)
    {
        json filas;
        for (int j = 0; j < mat.rows; j++)
        {
            filas.push_back(input[mat.cols * j + i]);
        }
        columnas.push_back(filas);
    }
    return columnas;
}

std::vector<Data2D> json2Data2DVector(json *v2)
{
    std::vector<Data2D> ref2D;
    for (json::iterator it = v2->begin(); it != v2->end(); ++it)
    {
        Data2D temp;
        temp.x = (*it)[0];
        temp.y = (*it)[1];
        ref2D.push_back(temp);
    }
    return ref2D;
}

std::vector<Data3D> json2Data3DVector(json *v2)
{
    std::vector<Data3D> ref2D;
    for (json::iterator it = v2->begin(); it != v2->end(); ++it)
    {
        Data3D temp;
        temp.x = (*it)[0];
        temp.y = (*it)[1];
        temp.z = (*it)[2];
        ref2D.push_back(temp);
    }
    return ref2D;
}

void computeCamera(json *data, std::vector<Data2D> ref2D, std::vector<Data3D> ref3D)
{
    // Read points
    std::vector<cv::Point2f> imagePoints = Generate2DPoints(ref2D);
    std::vector<cv::Point3f> objectPoints = Generate3DPoints(ref3D);

    cv::Mat cameraMatrix(3, 3, cv::DataType<double>::type);
    cv::setIdentity(cameraMatrix);

    cv::Mat distCoeffs(4, 1, cv::DataType<double>::type);
    distCoeffs.at<double>(0) = 0;
    distCoeffs.at<double>(1) = 0;
    distCoeffs.at<double>(2) = 0;
    distCoeffs.at<double>(3) = 0;

    cv::Mat rvec(3, 1, cv::DataType<double>::type);
    cv::Mat tvec(3, 1, cv::DataType<double>::type);

    cv::solvePnP(objectPoints, imagePoints, cameraMatrix, distCoeffs, rvec, tvec);

    cv::Mat aux = cv::Mat::eye(3, 3, CV_32F);
    // Converts a rotation matrix to a rotation vector or vice versa.
    cv::Rodrigues(rvec, aux);

    (*data)["rvec"] = cvMat2json(rvec);
    (*data)["tvec"] = cvMat2json(tvec);
    (*data)["aux"] = cvMat2json(aux);
}

std::vector<cv::Point2f> guessPoints(std::vector<Data3D> questionIn, std::vector<Data2D> ref2D, std::vector<Data3D> ref3D)
{
    // Read points
    std::vector<cv::Point2f> imagePoints = Generate2DPoints(ref2D);
    std::vector<cv::Point3f> objectPoints = Generate3DPoints(ref3D);
    std::vector<cv::Point3f> question = Generate3DPoints(questionIn);

    cv::Mat cameraMatrix(3, 3, cv::DataType<double>::type);
    cv::setIdentity(cameraMatrix);

    cv::Mat distCoeffs(4, 1, cv::DataType<double>::type);
    distCoeffs.at<double>(0) = 0;
    distCoeffs.at<double>(1) = 0;
    distCoeffs.at<double>(2) = 0;
    distCoeffs.at<double>(3) = 0;

    cv::Mat rvec(3, 1, cv::DataType<double>::type);
    cv::Mat tvec(3, 1, cv::DataType<double>::type);

    cv::solvePnP(objectPoints, imagePoints, cameraMatrix, distCoeffs, rvec, tvec);

    cv::Mat aux = cv::Mat::eye(3, 3, CV_32F);
    // Converts a rotation matrix to a rotation vector or vice versa.
    cv::Rodrigues(rvec, aux);

    std::cout << "rvec: " << rvec << std::endl;
    std::cout << "aux: " << aux << std::endl;
    std::cout << "tvec: " << tvec << std::endl;

    std::vector<cv::Point2f> projectedPoints;
    cv::projectPoints(question, rvec, tvec, cameraMatrix, distCoeffs, projectedPoints);
    return projectedPoints;
}

std::vector<cv::Point2f> Generate2DPoints(std::vector<Data2D> input)
{
    std::vector<cv::Point2f> points;
    for (uint i = 0; i < input.size(); i++)
    {
        Data2D elem = input[i];
        points.push_back(cv::Point2f(elem.x, elem.y));
    }
    return points;
}

std::vector<cv::Point3f> Generate3DPoints(std::vector<Data3D> input)
{
    std::vector<cv::Point3f> points;
    for (uint i = 0; i < input.size(); i++)
    {
        Data3D elem = input[i];
        points.push_back(cv::Point3f(elem.x, elem.y, elem.z));
    }
    return points;
}

#endif