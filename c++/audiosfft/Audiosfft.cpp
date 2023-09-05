/**
 * This program takes a set of corresponding 2D and 3D points and finds the transformation matrix
 * that best brings the 3D points to their corresponding 2D points.
 */
#include "Audiosfft.h"
#include "audio.h"
#include "utils.h"

#include <iostream>
#include <string>

int main(int argc, char *argv[])
{
    cv::CommandLineParser parser(argc, argv,
                                 "{@input   i|../data/example.json|input json file}"
                                 "{@output   o|../data/output.json|output json file}");
    parser.printMessage();
    std::string inputFilePath = parser.get<cv::String>("@input");
    std::string outputFilePath = parser.get<cv::String>("@output");
    std::string fileContent = readTextFile(inputFilePath);
    json inputData = json::parse(fileContent);

    cv::Mat gray = createGrayScaleImage(256, 256, 255);

    PaStreamParameters inputParameters;
    inputParameters.device = inputData["device"];
    if (!initializeAudio())
    {
        return -1;
    }
    std::cout << "initializeAudio Ok!" << std::endl;

    PaStream *stream = NULL;
    if (inputData["program"] == 1)
    {
        displayAudioDevices();
    }
    else if (inputData["program"] == 2)
    {
        paTestData audioData;

        stream = sampleAudio(&audioData, stream, &inputParameters, &inputData);

        while (true)
        {
            showImage(&gray);
            int value = cv::waitKey(1);
            // std::cout << value << std::endl;
            // printf("Pa_StartStream ok: %p\n", stream);
            if (value == 113)
            {
                break;
            }
        }

        gray.release();
    }

    if (terminateAudio(stream))
    {
        std::cout << "terminateAudio Ok!" << std::endl;
    }

    std::string s = inputData.dump();
    //writeTextFile(s, outputFilePath);
    std::cout << s << std::endl;

    return 0;
}
