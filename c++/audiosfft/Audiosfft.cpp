/**
 * This program takes a set of corresponding 2D and 3D points and finds the transformation matrix
 * that best brings the 3D points to their corresponding 2D points.
 */
#include "Audiosfft.h"
#include "audio.h"
#include "utils.h"

#include <iostream>
#include <string>

// Pyton https://www.tensorflow.org/tutorials/audio/simple_audio?hl=es-419

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

    UserAudioData audioData;
    unsigned int numSamples = floor((float)inputData["SECONDS"] * (unsigned int)inputData["SAMPLE_RATE"]);
    int numBytes = numSamples * sizeof(SAMPLE);
    std::cout << "Buffer has " << numBytes << " bytes with " << numSamples << " samples" << std::endl;
    audioData.startingPoint = 0;
    audioData.maxSize = numSamples;
    audioData.line = (SAMPLE *)malloc(numBytes);
    if (audioData.line == NULL)
    {
        std::cout << "Error reservando " << numBytes << " bytes" << std::endl;
        return -1;
    }
    else
    {
        std::cout << "Reservados " << numBytes << " bytes" << std::endl;
    }
    for (unsigned int i = 0; i < numSamples; i++)
    {
        audioData.line[i] = 0;
    }

    cv::Mat gray = createGrayScaleImage(sizeof(IMAGE_MAT_TYPE) * 256, inputData["DISPLAY_WIDTH"], 0);

    if (!initializeAudio())
    {
        return -1;
    }

    PaStreamParameters inputParameters;
    inputParameters.device = inputData["device"];
    if (inputParameters.device < 0)
    {
        inputParameters.device = Pa_GetDefaultInputDevice();
    }
    std::cout << "inputParameters.device = " << inputParameters.device << std::endl;

    PaStream *stream = NULL;
    if (inputData["program"] == 1)
    {
        displayAudioDevices();
    }
    else if (inputData["program"] == 2)
    {
        stream = sampleAudio(&audioData, stream, &inputParameters, &inputData);

        while (true)
        {
            printAudioOnImage(&gray, &audioData, &inputData);
            showImage(&gray);
            int value = cv::waitKey(1);
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
    // writeTextFile(s, outputFilePath);
    std::cout << s << std::endl;

    free(audioData.line);
    return 0;
}
