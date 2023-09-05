#include "portaudio.h"
#include <stdio.h>

#define SAMPLE_RATE (44100)

typedef struct
{
    float left_phase;
    float right_phase;
} paTestData;
/* This routine will be called by the PortAudio engine when audio is needed.
 * It may called at interrupt level on some machines so don't do anything
 * that could mess up the system like calling malloc() or free().
 */
static int patestCallback(const void *inputBuffer, void *outputBuffer,
                          unsigned long framesPerBuffer,
                          const PaStreamCallbackTimeInfo *timeInfo,
                          PaStreamCallbackFlags statusFlags,
                          void *userData)
{
    /* Cast data passed through stream to our structure. */
    paTestData *data = (paTestData *)userData;
    float *out = (float *)outputBuffer;
    unsigned int i;
    (void)inputBuffer; /* Prevent unused variable warning. */

    // std::cout << framesPerBuffer << std::endl;
    for (i = 0; i < framesPerBuffer; i++)
    {
    }
    return 0;
}

PaStream *sampleAudio(paTestData *data, PaStream *stream, PaStreamParameters *inputParameters, json *inputData)
{
    PaError err;
    inputParameters->channelCount = (*inputData)["channelCount"];
    inputParameters->sampleFormat = paUInt8;
    inputParameters->suggestedLatency = Pa_GetDeviceInfo(inputParameters->device)->defaultLowInputLatency;
    inputParameters->hostApiSpecificStreamInfo = NULL;
    /* Open an audio I/O stream. */
    // Read Pa_OpenStream
    /*
    err = Pa_OpenDefaultStream(&stream,
                               0,         // no input channels
                               1,         // The number of channels of sound to be delivered to the stream callback
                               paFloat32, // 32 bit floating point output
                               SAMPLE_RATE,
                               256,            // frames per buffer, i.e. the number
                               patestCallback, // this is your callback function
                               &data);         // This is a pointer that will be passed
                               */
    err = Pa_OpenStream(
        &stream,
        inputParameters,
        NULL,
        SAMPLE_RATE,
        paFramesPerBufferUnspecified,
        paClipOff,
        patestCallback,
        &data);
    if (err != paNoError)
    {
        printf("Pa_OpenDefaultStream error: %s\n", Pa_GetErrorText(err));
        return NULL;
    }

    err = Pa_StartStream(stream);
    if (err != paNoError)
    {
        printf("Pa_StartStream error: %s\n", Pa_GetErrorText(err));
        return NULL;
    }
    else
    {
        printf("Pa_StartStream ok: %p\n", stream);
        return stream;
    }
}

bool initializeAudio()
{
    PaError err = Pa_Initialize();
    if (err != paNoError)
    {
        printf("Pa_Initialize error: %s\n", Pa_GetErrorText(err));
        return false;
    }
    return true;
}

bool terminateAudio(PaStream *stream)
{
    PaError err;
    if (stream != NULL)
    {
        err = Pa_CloseStream(stream);
        if (err != paNoError)
        {
            printf("Pa_CloseStream error: %p %s\n", stream, Pa_GetErrorText(err));
            return false;
        }
    }
    err = Pa_Terminate();
    if (err != paNoError)
    {
        printf("Pa_Terminate error: %s\n", Pa_GetErrorText(err));
        return false;
    }
    return true;
}

static void PrintSupportedStandardSampleRates(
    const PaStreamParameters *inputParameters,
    const PaStreamParameters *outputParameters)
{
    static double standardSampleRates[] = {
        8000.0, 9600.0, 11025.0, 12000.0, 16000.0, 22050.0, 24000.0, 32000.0,
        44100.0, 48000.0, 88200.0, 96000.0, 192000.0, -1 /* negative terminated  list */
    };
    int i, printCount;
    PaError err;

    printCount = 0;
    for (i = 0; standardSampleRates[i] > 0; i++)
    {
        err = Pa_IsFormatSupported(inputParameters, outputParameters, standardSampleRates[i]);
        if (err == paFormatIsSupported)
        {
            if (printCount == 0)
            {
                printf("\t%8.2f", standardSampleRates[i]);
                printCount = 1;
            }
            else if (printCount == 4)
            {
                printf(",\n\t%8.2f", standardSampleRates[i]);
                printCount = 1;
            }
            else
            {
                printf(", %8.2f", standardSampleRates[i]);
                ++printCount;
            }
        }
    }
    if (!printCount)
        printf("None\n");
    else
        printf("\n");
}

void displayAudioDevices()
{
    int i, numDevices, defaultDisplayed;
    const PaDeviceInfo *deviceInfo;
    PaStreamParameters inputParameters, outputParameters;
    PaError err;
    numDevices = Pa_GetDeviceCount();
    if (numDevices < 0)
    {
        printf("ERROR: Pa_GetDeviceCount returned 0x%x\n", numDevices);
        return;
    }
    std::cout << "numDevices = " << numDevices << std::endl;

    for (i = 0; i < numDevices; i++)
    {
        deviceInfo = Pa_GetDeviceInfo(i);
        printf("--------------------------------------- device #%d\n", i);

        /* Mark global and API specific default devices */
        defaultDisplayed = 0;
        if (i == Pa_GetDefaultInputDevice())
        {
            printf("[ Default Input");
            defaultDisplayed = 1;
        }
        else if (i == Pa_GetHostApiInfo(deviceInfo->hostApi)->defaultInputDevice)
        {
            const PaHostApiInfo *hostInfo = Pa_GetHostApiInfo(deviceInfo->hostApi);
            printf("[ Default %s Input", hostInfo->name);
            defaultDisplayed = 1;
        }

        if (i == Pa_GetDefaultOutputDevice())
        {
            printf((defaultDisplayed ? "," : "["));
            printf(" Default Output");
            defaultDisplayed = 1;
        }
        else if (i == Pa_GetHostApiInfo(deviceInfo->hostApi)->defaultOutputDevice)
        {
            const PaHostApiInfo *hostInfo = Pa_GetHostApiInfo(deviceInfo->hostApi);
            printf((defaultDisplayed ? "," : "["));
            printf(" Default %s Output", hostInfo->name);
            defaultDisplayed = 1;
        }

        if (defaultDisplayed)
            printf(" ]\n");

            /* print device info fields */
#ifdef WIN32
        { /* Use wide char on windows, so we can show UTF-8 encoded device names */
            wchar_t wideName[MAX_PATH];
            MultiByteToWideChar(CP_UTF8, 0, deviceInfo->name, -1, wideName, MAX_PATH - 1);
            wprintf(L"Name                        = %s\n", wideName);
        }
#else
        printf("Name                        = %s\n", deviceInfo->name);
#endif
        printf("Host API                    = %s\n", Pa_GetHostApiInfo(deviceInfo->hostApi)->name);
        printf("Max inputs = %d", deviceInfo->maxInputChannels);
        printf(", Max outputs = %d\n", deviceInfo->maxOutputChannels);

        printf("Default low input latency   = %8.4f\n", deviceInfo->defaultLowInputLatency);
        printf("Default low output latency  = %8.4f\n", deviceInfo->defaultLowOutputLatency);
        printf("Default high input latency  = %8.4f\n", deviceInfo->defaultHighInputLatency);
        printf("Default high output latency = %8.4f\n", deviceInfo->defaultHighOutputLatency);

#ifdef WIN32
#if PA_USE_ASIO
        /* ASIO specific latency information */
        if (Pa_GetHostApiInfo(deviceInfo->hostApi)->type == paASIO)
        {
            long minLatency, maxLatency, preferredLatency, granularity;

            err = PaAsio_GetAvailableLatencyValues(i,
                                                   &minLatency, &maxLatency, &preferredLatency, &granularity);

            printf("ASIO minimum buffer size    = %ld\n", minLatency);
            printf("ASIO maximum buffer size    = %ld\n", maxLatency);
            printf("ASIO preferred buffer size  = %ld\n", preferredLatency);

            if (granularity == -1)
                printf("ASIO buffer granularity     = power of 2\n");
            else
                printf("ASIO buffer granularity     = %ld\n", granularity);
        }
#endif /* PA_USE_ASIO */
#endif /* WIN32 */

        printf("Default sample rate         = %8.2f\n", deviceInfo->defaultSampleRate);

        /* poll for standard sample rates */
        inputParameters.device = i;
        inputParameters.channelCount = deviceInfo->maxInputChannels;
        inputParameters.sampleFormat = paInt16;
        inputParameters.suggestedLatency = 0; /* ignored by Pa_IsFormatSupported() */
        inputParameters.hostApiSpecificStreamInfo = NULL;

        outputParameters.device = i;
        outputParameters.channelCount = deviceInfo->maxOutputChannels;
        outputParameters.sampleFormat = paInt16;
        outputParameters.suggestedLatency = 0; /* ignored by Pa_IsFormatSupported() */
        outputParameters.hostApiSpecificStreamInfo = NULL;

        if (inputParameters.channelCount > 0)
        {
            printf("Supported standard sample rates\n for half-duplex 16 bit %d channel input = \n",
                   inputParameters.channelCount);
            PrintSupportedStandardSampleRates(&inputParameters, NULL);
        }

        if (outputParameters.channelCount > 0)
        {
            printf("Supported standard sample rates\n for half-duplex 16 bit %d channel output = \n",
                   outputParameters.channelCount);
            PrintSupportedStandardSampleRates(NULL, &outputParameters);
        }

        if (inputParameters.channelCount > 0 && outputParameters.channelCount > 0)
        {
            printf("Supported standard sample rates\n for full-duplex 16 bit %d channel input, %d channel output = \n",
                   inputParameters.channelCount, outputParameters.channelCount);
            PrintSupportedStandardSampleRates(&inputParameters, &outputParameters);
        }
    }
}