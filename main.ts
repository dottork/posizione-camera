/**
 * TRANSFORM.C
 */
function convertIntToAngle (angolo: any[]) {
    return angle[0] + angle[1] / 60 + angle[2] / 3600
}
function readAccelerometerRaw () {
    accData[0] = 0
    accData[1] = 0
    accData[2] = 0
    for (let index = 0; index < IntegrationSteps; index++) {
        accData[0] = accData[0] + input.acceleration(Dimension.X)
        accData[1] = accData[1] + input.acceleration(Dimension.Y)
        accData[2] = accData[2] + input.acceleration(Dimension.Z)
    }
    accData[0] = accData[0] / IntegrationSteps
    accData[1] = accData[1] / IntegrationSteps
    accData[2] = accData[2] / IntegrationSteps
}
function fixTiltCompensate () {
    roll = Math.asin(accData[1])
    pitch = 0 - Math.asin(accData[0])
    return 0
}
function MainCycle () {
    readMagnetometerNormalize()
    readAccelerometerScaled()
    compassHeading = 0
}
function getPitchFromAccelerometer () {
    readAccelerometerRaw()
    incli = Math.atan2(accData[0], Math.sqrt(accData[1] ** 2 + accData[2] ** 2))
    if (accData[2] < 0) {
        incli = PI - incli
    }
    return fixAngle(incli) * 180 / PI
}
function fixAngle (angolo: number) {
    t = angolo
    if (t < 0) {
        t += 2 * PI
    }
    if (t > 2 * PI) {
        t += 0 - 2 * PI
    }
    return t
}
function readMagnetometerNormalize () {
    return 0
}
function extractTimeInfo (buffer: string) {
    dateTimeInfo[3] = parseFloat(buffer.substr(4, 2))
    dateTimeInfo[4] = parseFloat(buffer.substr(7, 2))
    dateTimeInfo[5] = parseFloat(buffer.substr(10, 2))
}
/**
 * PROTOCOL
 * 
 * controllare protrebbe essere sbagliato di 1
 * 
 * MSG_DATA_OFFSET 0x04
 */
function extractAngle (text: string) {
    tempAngle[0] = parseFloat(text.substr(5, 3))
    tempAngle[1] = parseFloat(text.substr(9, 2))
    tempAngle[2] = parseFloat(text.substr(12, 2))
    if (text.substr(4, 1) == "-") {
        tempAngle[0] = tempAngle[0] * -1
    }
    return convertIntToAngle(tempAngle)
}
function convertAngleToInt (angolo: number) {
    angle[0] = Math.trunc(angolo)
    t = Math.abs(angolo - angle[0])
    angle[1] = Math.trunc(t * 60)
    angle[2] = Math.trunc((t - angle[1] * (1 / 60)) * 3600)
}
function readAccelerometerScaled () {
    readAccelerometerRaw()
}
function extractDateInfo (buffer: string) {
    dateTimeInfo[0] = parseFloat(buffer.substr(4, 2))
    dateTimeInfo[1] = parseFloat(buffer.substr(4, 2))
    dateTimeInfo[2] = parseFloat(buffer.substr(4, 2))
}
let t = 0
let incli = 0
let compassHeading = 0
let pitch = 0
let roll = 0
let IntegrationSteps = 0
let dateTimeInfo: number[] = []
let accData: number[] = []
let tempAngle: number[] = []
let angle: number[] = []
let PI = 0
serial.redirectToUSB()
PI = 3.14159265
angle = [0, 0, 0]
tempAngle = [0, 0, 0]
accData = [0, 0, 0]
let compData = [0, 0, 0]
dateTimeInfo = [
0,
0,
0,
0,
0,
0
]
IntegrationSteps = 20
basic.forever(function () {
    convertAngleToInt(getPitchFromAccelerometer())
    serial.writeLine("A" + convertToText(angle[0]) + "A" + convertToText(angle[1]) + "A" + convertToText(angle[2]) + "0")
})
