import * as dotenv from "dotenv";
import Obniz from "obniz";
import {Xyz} from "obniz/dist/src/parts/i2cParts";
import {postLineNotify} from "./libs/api";

dotenv.config();

const obniz = new Obniz.M5StickC(process.env.OBNIZ_ID || "");

obniz.onconnect = async function () {
    await obniz.setupIMUWait();
    let accel: Xyz | null = (await obniz.imu?.getAccelWait()) || null;
    let gyro = await obniz.imu?.getGyroWait();
    let prevAccel: Xyz | null = null;
    let counter = 0;
    let sum: Xyz = {
        x: 0,
        y: 0,
        z: 0,
    };
    let isStart = false

    setInterval(async () => {
        accel = (await obniz.imu?.getAccelWait()) || null;
        await obniz.pingWait();

        if (accel && prevAccel) {
            const x = Math.abs(accel.x - prevAccel.x);
            const y = Math.abs(accel.y - prevAccel.y);
            const z = Math.abs(accel.z - prevAccel.z);
            sum.x += x;
            sum.y += y;
            sum.z += z;
        }

        prevAccel = accel;
        counter++;

        if (counter <= 30) return;
        console.log(sum)
        if (Object.values(sum).some(v => v > 0.25)) {
            if (!isStart) {
                await postLineNotify('洗濯機の稼働が開始しました')
                console.log('start')
                isStart = true
            }
        } else {
            if (isStart) {
                await postLineNotify('洗濯機の稼働が終了しました')
                console.log('stop')
                isStart = false
            }
        }
        sum = {x: 0, y: 0, z: 0};
        counter = 0;
    }, 1000);
};
