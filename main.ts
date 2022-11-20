/**
 * Main
 */
function convertIntToAngle (tlist: number[]) {
    return tlist[0] + tlist[1] / 60 + tlist[2] / 3600
}
// modulo accelerometro
function readAccelerometerRaw (aD: number[]) {
    aD[0] = 0
    aD[1] = 0
    aD[2] = 0
    for (let index = 0; index < IntegrationSteps; index++) {
        aD[0] = aD[0] + input.acceleration(Dimension.X)
        aD[1] = aD[1] + input.acceleration(Dimension.Y)
        aD[2] = aD[2] + input.acceleration(Dimension.Z)
    }
    aD[0] = aD[0] / IntegrationSteps
    aD[1] = aD[1] / IntegrationSteps
    aD[2] = aD[2] / IntegrationSteps
}
function decSign (num: number) {
    if (num < 0) {
        return "-"
    } else {
        return "+"
    }
}
function fixTiltCompensate (cD: any[], aD: any[]) {
    roll = Math.asin(aD[1])
    pitch = 0 - Math.asin(aD[0])
    if (roll > 0.78 || roll < -0.78 || pitch > 0.78 || pitch < -0.78) {
        return Math.atan2(cD[1], cD[0])
    }
    tiltX = cD[0] * Math.cos(pitch) + cD[2] * Math.sin(pitch)
    tiltY = cD[0] * Math.sin(roll) * Math.sin(pitch) + cD[1] * Math.cos(roll) - cD[2] * Math.sin(roll) * Math.cos(pitch)
    return Math.atan2(tiltY, tiltX)
}
function getPitchFromAccelerometer (aD: any[], offset: number) {
    incli = Math.atan2(aD[0], Math.sqrt(aD[1] ** 2 + aD[2] ** 2)) + offset
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
function convertAzAltToRaDec () {
	
}
// Modulo magnetometro
function readMagnetometerNormalize (cD: any[]) {
    return 0
}
function extractTimeInfo (buffer: string) {
    dateTimeInfo[3] = parseFloat(buffer.substr(4, 2))
    dateTimeInfo[4] = parseFloat(buffer.substr(7, 2))
    dateTimeInfo[5] = parseFloat(buffer.substr(10, 2))
}
// Da capire
function isSettingsCommand (inBuffer: string, matchStr: string) {
	
}
// Ricezione comandi
serial.onDataReceived(serial.delimiters(Delimiters.Hash), function () {
    buf = serial.readString()
    if (buf.includes("#:GR#")) {
        msgState = 1
    }
    if (buf.includes("#:GD#")) {
        msgState = 2
    }
    if (buf.includes("SC")) {
        msgState = 3
    }
    if (buf.includes("SL")) {
        msgState = 4
    }
    if (buf.includes("St")) {
        msgState = 5
    }
    if (buf.includes("Sg")) {
        msgState = 6
    }
    if (buf.includes("Sm")) {
        msgState = 7
    }
    if (buf.includes("Sv")) {
        msgState = 8
    }
})
// PROTOCOL
// controllare protrebbe essere sbagliato di 1 quindi 5->6 9->10 12->13
// MSG_DATA_OFFSET 0x04
function extractAngle (text: string) {
    tempAngle[0] = parseFloat(text.substr(5, 3))
    tempAngle[1] = parseFloat(text.substr(9, 2))
    tempAngle[2] = parseFloat(text.substr(12, 2))
    if (text.substr(4, 1) == "-") {
        tempAngle[0] = tempAngle[0] * -1
    }
    return convertIntToAngle(tempAngle)
}
// Modulo: transform.c
function convertAngleToInt (angolo: number, tlist: number[]) {
    tlist[0] = Math.trunc(angolo)
    t = Math.abs(angolo - angle[0])
    tlist[1] = Math.trunc(t * 60)
    tlist[2] = Math.trunc((t - angle[1] * (1 / 60)) * 3600)
}
function pad2 (num: number) {
    return ("00" + convertToText(num)).substr(("00" + convertToText(num)).length - 2, 2)
}
function readAccelerometerScaled (aS: any[]) {
    readAccelerometerRaw(aS)
}
// TRANSFORM.C
function extractDateInfo (buffer: string) {
    dateTimeInfo[0] = parseFloat(buffer.substr(4, 2))
    dateTimeInfo[1] = parseFloat(buffer.substr(4, 2))
    dateTimeInfo[2] = parseFloat(buffer.substr(4, 2))
}
let compassHeading = 0
let msgState = 0
let buf = ""
let t = 0
let incli = 0
let tiltY = 0
let tiltX = 0
let pitch = 0
let roll = 0
let IntegrationSteps = 0
let dateTimeInfo: number[] = []
let accData: number[] = []
let tempAngle: number[] = []
let angle: number[] = []
let PI = 0
let resDEC = 0
serial.redirectToUSB()
PI = 3.141592653589793
angle = [0, 0, 0]
let angleRA = [0, 0, 0]
let angleDEC = [0, 0, 0]
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
let tm = [
0,
0,
0,
0,
0,
0,
0,
0
]
IntegrationSteps = 20
basic.forever(function () {
    let resRA = 0
    readMagnetometerNormalize(compData)
    readAccelerometerScaled(accData)
    convertAngleToInt(resRA, angleRA)
    compassHeading = 0
    // serial.writeLine("A" + convertToText(angle[0]) + "A" + convertToText(angle[1]) + "A" + convertToText(angle[2]) + "0")
    if (msgState == 1) {
        serial.writeString("" + convertToText(angleRA[0]) + ":" + convertToText(angleRA[1]) + ":" + convertToText(angleRA[2]) + "#")
    }
    if (msgState == 2) {
        serial.writeString("" + convertToText(decSign(angleDEC[0])) + convertToText(Math.abs(angleDEC[0])) + "*" + convertToText(angleDEC[1]) + ":" + convertToText(angleDEC[2]) + "#")
    }
})
