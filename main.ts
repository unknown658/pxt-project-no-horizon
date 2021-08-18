/*
  Kitronik package for use with the Air Quality Board (www.kitronik.co.uk/5674)
  This package pulls in other packages to deal with the lower level work for:
    Setting and reading a Real Time Clock chip
*/

/**
* Well known colors for ZIP LEDs
*/
enum ZipLedColors {
    //% block=red
    Red = 0xFF0000,
    //% block=orange
    Orange = 0xFFA500,
    //% block=yellow
    Yellow = 0xFFFF00,
    //% block=green
    Green = 0x00FF00,
    //% block=blue
    Blue = 0x0000FF,
    //% block=indigo
    Indigo = 0x4b0082,
    //% block=violet
    Violet = 0x8a2be2,
    //% block=purple
    Purple = 0xFF00FF,
    //% block=white
    White = 0xFFFFFF,
    //% block=black
    Black = 0x000000
}

/** 
 * Different time options for the Real Time Clock
 */
enum TimeParameter {
    //% block=hours
    Hours,
    //% block=minutes
    Minutes,
    //% block=seconds
    Seconds
}

/**
 * Different date options for the Real Time Clock
 */
enum DateParameter {
    //% block=day
    Day,
    //% block=month
    Month,
    //% block=year
    Year
}

//List of different temperature units
enum TemperatureUnitList {
    //% block="°C"
    C,
    //% block="°F"
    F
}

//List of different pressure units
enum PressureUnitList {
    //% block="Pa"
    Pa,
    //% block="mBar"
    mBar
}

/**
 * Kitronik Air Quality Board MakeCode Extension
 */

//% weight=100 color=#00A654 icon="\uf0c2" block="Air Quality"
//% groups='["Control", "Show", "Draw", "Delete", "Advanced", "Set Time", "Set Date", "Read Time", "Read Date", "Alarm", "Setup", "Measure", "Climate", "Air Quality", "General Inputs/Outputs", "Write", "Read," "Setup", "Add Data", "Transfer"]'
namespace kitronik_air_quality {
    ////////////////////////////////
    //         ZIP LEDS           //
    ////////////////////////////////

    export class airQualityZIPLEDs {
        buf: Buffer;
        pin: DigitalPin;
        brightness: number;
        start: number;
        _length: number;

        /** 
         * Create a range of LEDs.
         * @param start offset in the LED strip to start the range
         * @param length number of LEDs in the range. eg: 2
         */
        //% subcategory="ZIP LEDs"
        //% weight=89 blockGap=8
        //% blockId="kitronik_air_quality_range" block="%statusLEDs|range from %start|with %length|LEDs"
        range(start: number, length: number): airQualityZIPLEDs {
            start = start >> 0;
            length = length >> 0;
            let zipLEDs = new airQualityZIPLEDs();
            zipLEDs.buf = this.buf;
            zipLEDs.pin = this.pin;
            zipLEDs.brightness = this.brightness;
            zipLEDs.start = this.start + Math.clamp(0, this._length - 1, start);
            zipLEDs._length = Math.clamp(0, this._length - (zipLEDs.start - this.start), length);
            return zipLEDs;
        }

        /**
         * Rotate LEDs forward.
         * You need to call ``show`` to make the changes visible.
         * @param offset number of ZIP LEDs to rotate forward, eg: 1
         */
        //% subcategory="ZIP LEDs"
        //% blockId="kitronik_air_quality_display_rotate" block="%statusLEDs|rotate ZIP LEDs by %offset" blockGap=8
        //% weight=92
        rotate(offset: number = 1): void {
            this.buf.rotate(-offset * 3, this.start * 3, this._length * 3)
        }
        /**
         * Sets all the ZIP LEDs to a given color (range 0-255 for r, g, b). Call Show to make changes visible 
         * @param rgb RGB color of the LED
         */
        //% subcategory="ZIP LEDs"
        //% blockId="kitronik_air_quality_display_only_set_strip_color" block="%statusLEDs|set color %rgb=kitronik_air_quality_colors" 
        //% weight=96 blockGap=8
        setColor(rgb: number) {
            rgb = rgb >> 0;
            this.setAllRGB(rgb);
        }
        /**
         * Shows all the ZIP LEDs as a given color (range 0-255 for r, g, b). 
         * @param rgb RGB color of the LED
         */
        //% subcategory="ZIP LEDs"
        //% blockId="kitronik_air_quality_display_set_strip_color" block="%statusLEDs|show color %rgb=kitronik_air_quality_colors" 
        //% weight=97 blockGap=8
        showColor(rgb: number) {
            rgb = rgb >> 0;
            this.setAllRGB(rgb);
            this.show();
        }

        /**
         * Set particular ZIP LED to a given color. 
         * You need to call ``show changes`` to make the changes visible.
         * @param zipLedNum position of the ZIP LED in the string
         * @param rgb RGB color of the ZIP LED
         */
        //% subcategory="ZIP LEDs"
        //% blockId="kitronik_air_quality_set_zip_color" block="%statusLEDs|set ZIP LED %zipLedNum|to %rgb=kitronik_air_quality_colors" 
        //% weight=95 blockGap=8
        setZipLedColor(zipLedNum: number, rgb: number): void {
            this.setPixelRGB(zipLedNum >> 0, rgb >> 0);
        }

        /**
         * Send all the changes to the ZIP LEDs.
         */
        //% subcategory="ZIP LEDs"
        //% blockId="kitronik_air_quality_display_show" block="%statusLEDs|show"
        //% weight=94 blockGap=8
        show() {
            //use the Kitronik version which respects brightness for all 
            //ws2812b.sendBuffer(this.buf, this.pin, this.brightness);
            // Use the pxt-microbit core version which now respects brightness (10/2020)
            light.sendWS2812BufferWithBrightness(this.buf, this.pin, this.brightness);
            control.waitMicros(100) // This looks messy, but it fixes the issue sometimes found when using multiple ZIP LED ranges, where the settings for the first range are clocked through to the next range. A short pause allows the ZIP LEDs to realise they need to stop pushing data.
        }

        /**
         * Turn off all the ZIP LEDs.
         * You need to call ``show`` to make the changes visible.
         */
        //% subcategory="ZIP LEDs"
        //% blockId="kitronik_air_quality_display_clear" block="%statusLEDs|clear"
        //% weight=93 blockGap=8
        clear(): void {
            this.buf.fill(0, this.start * 3, this._length * 3);
        }

        /**
         * Set the brightness of the ZIP LEDs. This flag only applies to future show operation.
         * @param brightness a measure of LED brightness in 0-255. eg: 255
         */
        //% subcategory="ZIP LEDs"
        //% blockId="kitronik_air_quality_display_set_brightness" block="%statusLEDs|set brightness %brightness" blockGap=8
        //% weight=91
        //% brightness.min=0 brightness.max=255
        setBrightness(brightness: number): void {
            //Clamp incoming variable at 0-255 as values out of this range cause unexpected brightnesses as the lower level code only expects a byte.
            if (brightness < 0) {
                brightness = 0
            }
            else if (brightness > 255) {
                brightness = 255
            }
            this.brightness = brightness & 0xff;
            basic.pause(1) //add a pause to stop wierdnesses
        }

        //Sets up the buffer for pushing LED control data out to LEDs
        private setBufferRGB(offset: number, red: number, green: number, blue: number): void {
            this.buf[offset + 0] = green;
            this.buf[offset + 1] = red;
            this.buf[offset + 2] = blue;
        }

        //Separates out Red, Green and Blue data and fills the LED control data buffer for all LEDs
        private setAllRGB(rgb: number) {
            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            const end = this.start + this._length;
            for (let i = this.start; i < end; ++i) {
                this.setBufferRGB(i * 3, red, green, blue)
            }
        }

        //Separates out Red, Green and Blue data and fills the LED control data buffer for a single LED
        private setPixelRGB(pixeloffset: number, rgb: number): void {
            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return;

            pixeloffset = (pixeloffset + this.start) * 3;

            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            this.setBufferRGB(pixeloffset, red, green, blue)
        }
    }

    /**
     * Create a new ZIP LED driver for Air Quality Board.
     */
    //% subcategory="ZIP LEDs"
    //% blockId="kitronik_air_quality_display_create" block="Air Quality Board with 3 ZIP LEDs"
    //% weight=100 blockGap=8
    //% trackArgs=0,2
    //% blockSetVariable=statusLEDs
    export function createAirQualityZIPDisplay(): airQualityZIPLEDs {
        let statusLEDs = new airQualityZIPLEDs;
        statusLEDs.buf = pins.createBuffer(9);
        statusLEDs.start = 0;
        statusLEDs._length = 3;
        statusLEDs.setBrightness(128)
        statusLEDs.pin = DigitalPin.P8;
        pins.digitalWritePin(statusLEDs.pin, 0);
        return statusLEDs;
    }

    /**
     * Converts wavelength value to red, green, blue channels
     * @param wavelength value between 470 and 625. eg: 500
     */
    //% subcategory="ZIP LEDs"
    //% weight=1 blockGap=8
    //% blockId="kitronik_air_quality_wavelength" block="wavelength %wavelength|nm"
    //% wavelength.min=470 wavelength.max=625
    export function wavelength(wavelength: number): number {
        /*  The LEDs we are using have centre wavelengths of 470nm (Blue) 525nm(Green) and 625nm (Red) 
        * 	 We blend these linearly to give the impression of the other wavelengths. 
        *   as we cant wavelength shift an actual LED... (Ye canna change the laws of physics Capt)*/
        let r = 0;
        let g = 0;
        let b = 0;
        if ((wavelength >= 470) && (wavelength < 525)) {
            //We are between Blue and Green so mix those
            g = pins.map(wavelength, 470, 525, 0, 255);
            b = pins.map(wavelength, 470, 525, 255, 0);
        }
        else if ((wavelength >= 525) && (wavelength <= 625)) {
            //we are between Green and Red, so mix those
            r = pins.map(wavelength, 525, 625, 0, 255);
            g = pins.map(wavelength, 525, 625, 255, 0);
        }
        return packRGB(r, g, b);
    }

    /**
     * Converts hue (0-360) to an RGB value. 
     * Does not attempt to modify luminosity or saturation. 
     * Colours end up fully saturated. 
     * @param hue value between 0 and 360
     */
    //% subcategory="ZIP LEDs"
    //% weight=1 blockGap=8
    //% blockId="kitronik_air_quality_hue" block="hue %hue"
    //% hue.min=0 hue.max=360
    export function hueToRGB(hue: number): number {
        let redVal = 0
        let greenVal = 0
        let blueVal = 0
        let hueStep = 2.125
        if ((hue >= 0) && (hue < 120)) { //RedGreen section
            greenVal = Math.floor((hue) * hueStep)
            redVal = 255 - greenVal
        }
        else if ((hue >= 120) && (hue < 240)) { //GreenBlueSection
            blueVal = Math.floor((hue - 120) * hueStep)
            greenVal = 255 - blueVal
        }
        else if ((hue >= 240) && (hue < 360)) { //BlueRedSection
            redVal = Math.floor((hue - 240) * hueStep)
            blueVal = 255 - redVal
        }
        return ((redVal & 0xFF) << 16) | ((greenVal & 0xFF) << 8) | (blueVal & 0xFF);
    }

    /*  The LEDs we are using have centre wavelengths of 470nm (Blue) 525nm(Green) and 625nm (Red) 
    * 	 We blend these linearly to give the impression of the other wavelengths. 
    *   as we cant wavelength shift an actual LED... (Ye canna change the laws of physics Capt)*/

    /**
     * Converts value to red, green, blue channels
     * @param red value of the red channel between 0 and 255. eg: 255
     * @param green value of the green channel between 0 and 255. eg: 255
     * @param blue value of the blue channel between 0 and 255. eg: 255
     */
    //% subcategory="ZIP LEDs"
    //% weight=1 blockGap=8
    //% blockId="kitronik_air_quality_rgb" block="red %red|green %green|blue %blue"
    export function rgb(red: number, green: number, blue: number): number {
        return packRGB(red, green, blue);
    }

    /**
     * Gets the RGB value of a known color
    */
    //% subcategory="ZIP LEDs"
    //% weight=2 blockGap=8
    //% blockId="kitronik_air_quality_colors" block="%color"
    export function colors(color: ZipLedColors): number {
        return color;
    }

    //Combines individual RGB settings to be a single number
    function packRGB(a: number, b: number, c: number): number {
        return ((a & 0xFF) << 16) | ((b & 0xFF) << 8) | (c & 0xFF);
    }
    //Separates red value from combined number
    function unpackR(rgb: number): number {
        let r = (rgb >> 16) & 0xFF;
        return r;
    }
    //Separates green value from combined number
    function unpackG(rgb: number): number {
        let g = (rgb >> 8) & 0xFF;
        return g;
    }
    //Separates blue value from combined number
    function unpackB(rgb: number): number {
        let b = (rgb) & 0xFF;
        return b;
    }

    /**
     * Converts a hue saturation luminosity value into a RGB color
     */
    function hsl(h: number, s: number, l: number): number {
        h = Math.round(h);
        s = Math.round(s);
        l = Math.round(l);

        h = h % 360;
        s = Math.clamp(0, 99, s);
        l = Math.clamp(0, 99, l);
        let c = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000); //chroma, [0,255]
        let h1 = Math.idiv(h, 60);//[0,6]
        let h2 = Math.idiv((h - h1 * 60) * 256, 60);//[0,255]
        let temp = Math.abs((((h1 % 2) << 8) + h2) - 256);
        let x = (c * (256 - (temp))) >> 8;//[0,255], second largest component of this color
        let r$: number;
        let g$: number;
        let b$: number;
        if (h1 == 0) {
            r$ = c; g$ = x; b$ = 0;
        } else if (h1 == 1) {
            r$ = x; g$ = c; b$ = 0;
        } else if (h1 == 2) {
            r$ = 0; g$ = c; b$ = x;
        } else if (h1 == 3) {
            r$ = 0; g$ = x; b$ = c;
        } else if (h1 == 4) {
            r$ = x; g$ = 0; b$ = c;
        } else if (h1 == 5) {
            r$ = c; g$ = 0; b$ = x;
        }
        let m = Math.idiv((Math.idiv((l * 2 << 8), 100) - c), 2);
        let r = r$ + m;
        let g = g$ + m;
        let b = b$ + m;
        return packRGB(r, g, b);
    }

    /**
     * Options for direction hue changes, used by rainbow block (never visible to end user)
     */
    export enum HueInterpolationDirection {
        Clockwise,
        CounterClockwise,
        Shortest
    }

    ////////////////////////////////
    //            OLED            //
    ////////////////////////////////

    // ASCII Code to OLED 5x8 pixel character for display conversion
    let font: number[] = [];
    // Set all non-printable characters [0-31] to be '0x0022d422'
    for (let fontCH = 0; fontCH < 32; fontCH++) {
        font[fontCH] = 0x0022d422
    }
    font[32] = 0x00000000;  // Space
    font[33] = 0x000002e0;  // !
    font[34] = 0x00018060;  // "
    font[35] = 0x00afabea;  // #
    font[36] = 0x00aed6ea;  // $
    font[37] = 0x01991133;  // %
    font[38] = 0x010556aa;  // &
    font[39] = 0x00000060;  // '
    font[40] = 0x000045c0;  // (
    font[41] = 0x00003a20;  // )
    font[42] = 0x00051140;  // *
    font[43] = 0x00023880;  // +
    font[44] = 0x00002200;  // ,
    font[45] = 0x00021080;  // -
    font[46] = 0x00000100;  // .
    font[47] = 0x00111110;  // /
    font[48] = 0x0007462e;  // 0
    font[49] = 0x00087e40;  // 1
    font[50] = 0x000956b9;  // 2
    font[51] = 0x0005d629;  // 3
    font[52] = 0x008fa54c;  // 4
    font[53] = 0x009ad6b7;  // 5
    font[54] = 0x008ada88;  // 6
    font[55] = 0x00119531;  // 7
    font[56] = 0x00aad6aa;  // 8
    font[57] = 0x0022b6a2;  // 9
    font[58] = 0x00000140;  // :
    font[59] = 0x00002a00;  // ;
    font[60] = 0x0008a880;  // <
    font[61] = 0x00052940;  // =
    font[62] = 0x00022a20;  // >
    font[63] = 0x0022d422;  // ?
    font[64] = 0x00e4d62e;  // @
    font[65] = 0x000f14be;  // A
    font[66] = 0x000556bf;  // B
    font[67] = 0x0008c62e;  // C 
    font[68] = 0x0007463f;  // D 
    font[69] = 0x0008d6bf;  // E 
    font[70] = 0x000094bf;  // F 
    font[71] = 0x00cac62e;  // G 
    font[72] = 0x000f909f;  // H 
    font[73] = 0x000047f1;  // I 
    font[74] = 0x0017c629;  // J 
    font[75] = 0x0008a89f;  // K 
    font[76] = 0x0008421f;  // L
    font[77] = 0x01f1105f;  // M 
    font[78] = 0x01f4105f;  // N 
    font[79] = 0x0007462e;  // O 
    font[80] = 0x000114bf;  // P 
    font[81] = 0x000b6526;  // Q 
    font[82] = 0x010514bf;  // R 
    font[83] = 0x0004d6b2;  // S 
    font[84] = 0x0010fc21;  // T 
    font[85] = 0x0007c20f;  // U 
    font[86] = 0x00744107;  // V
    font[87] = 0x01f4111f;  // W 
    font[88] = 0x000d909b;  // X 
    font[89] = 0x00117041;  // Y 
    font[90] = 0x0008ceb9;  // Z
    font[91] = 0x0008c7e0;  // [
    font[92] = 0x01041041;  // \
    font[93] = 0x000fc620;  // ]
    font[94] = 0x00010440;  // ^
    font[95] = 0x01084210;  // _ 
    font[96] = 0x00000820;  // `
    font[97] = 0x010f4a4c;  // a 
    font[98] = 0x0004529f;  // b 
    font[99] = 0x00094a4c;  // c 
    font[100] = 0x000fd288; // d 
    font[101] = 0x000956ae; // e 
    font[102] = 0x000097c4; // f 
    font[103] = 0x0007d6a2; // g 
    font[104] = 0x000c109f; // h 
    font[105] = 0x000003a0; // i 
    font[106] = 0x0006c200; // j 
    font[107] = 0x0008289f; // k 
    font[108] = 0x000841e0; // l 
    font[109] = 0x01e1105e; // m 
    font[110] = 0x000e085e; // n 
    font[111] = 0x00064a4c; // o 
    font[112] = 0x0002295e; // p 
    font[113] = 0x000f2944; // q 
    font[114] = 0x0001085c; // r 
    font[115] = 0x00012a90; // s 
    font[116] = 0x010a51e0; // t 
    font[117] = 0x010f420e; // u 
    font[118] = 0x00644106; // v 
    font[119] = 0x01e8221e; // w 
    font[120] = 0x00093192; // x 
    font[121] = 0x00222292; // y 
    font[122] = 0x00095b52; // z
    font[123] = 0x0008fc80; // {
    font[124] = 0x000003e0; // |
    font[125] = 0x000013f1; // }
    font[126] = 0x00841080; // ~
    font[127] = 0x0022d422; // DEL

    /**
     * Select the alignment of text
     */
    export enum ShowAlign {
        //% block="Left"
        Left,
        //% block="Centre"
        Centre,
        //% block="Right"
        Right
    }

    /**
     * Select direction for drawing lines
     */
    export enum LineDirectionSelection {
        //% block="horizontal"
        horizontal,
        //% block="vertical"
        vertical
    }

    // Constants for Display
    let NUMBER_OF_CHAR_PER_LINE = 26

    // Default address for the display
    let DISPLAY_ADDR_1 = 60
    let DISPLAY_ADDR_2 = 10
    let displayAddress = DISPLAY_ADDR_1;

    // Text alignment, defaulted to "Left"
    let displayShowAlign = ShowAlign.Left

    // Plot variables
    let plotArray: number[] = []
    let plottingEnable = 0
    let plotData = 0;
    let graphYMin = 0
    let graphYMax = 100
    let graphRange = 100
    let GRAPH_Y_MIN_LOCATION = 63
    let GRAPH_Y_MAX_LOCATION = 20
    let previousYPlot = 0

    // Screen buffers for sending data to the display
    let screenBuf = pins.createBuffer(1025);
    let ackBuf = pins.createBuffer(2);
    let writeOneByteBuf = pins.createBuffer(2);
    let writeTwoByteBuf = pins.createBuffer(3);
    let writeThreeByteBuf = pins.createBuffer(4);

    let initialised = 0    		// Flag to indicate automatic initalisation of the display

    // Function to write one byte of data to the display
    function writeOneByte(regValue: number) {
        writeOneByteBuf[0] = 0;
        writeOneByteBuf[1] = regValue;
        pins.i2cWriteBuffer(displayAddress, writeOneByteBuf);
    }

    // Function to write two bytes of data to the display
    function writeTwoByte(regValue1: number, regValue2: number) {
        writeTwoByteBuf[0] = 0;
        writeTwoByteBuf[1] = regValue1;
        writeTwoByteBuf[2] = regValue2;
        pins.i2cWriteBuffer(displayAddress, writeTwoByteBuf);
    }

    // Function to write three bytes of data to the display
    function writeThreeByte(regValue1: number, regValue2: number, regValue3: number) {
        writeThreeByteBuf[0] = 0;
        writeThreeByteBuf[1] = regValue1;
        writeThreeByteBuf[2] = regValue2;
        writeThreeByteBuf[3] = regValue3;
        pins.i2cWriteBuffer(displayAddress, writeThreeByteBuf);
    }

    // Set the starting on the display for writing text
    function set_pos(col: number = 0, page: number = 0) {
        writeOneByte(0xb0 | page) // page number
        writeOneByte(0x00 | (col % 16)) // lower start column address
        writeOneByte(0x10 | (col >> 4)) // upper start column address    
    }

    // Set the particular data byte on the screen for clearing
    function clearBit(d: number, b: number): number {
        if (d & (1 << b))
            d -= (1 << b)
        return d
    }

    // Return the correct display I2C address based on selection
    function setScreenAddr(selection: number): number {
        let addr = 0
        if (selection == 1) {
            addr = DISPLAY_ADDR_1
        }
        else if (selection == 2) {
            addr = DISPLAY_ADDR_2
        }
        else {
            addr = DISPLAY_ADDR_1
        }
        return addr
    }

    /**
     * Setup the display ready for use (function on available in text languages, not blocks)
     * @param screen is the selection of which screen to initialise
     */
    export function initDisplay(screen?: number): void {

        displayAddress = setScreenAddr(screen)
        // Load the ackBuffer to check if there is a display there before starting initalisation
        ackBuf[0] = 0
        ackBuf[1] = 0xAF
        let ack = pins.i2cWriteBuffer(displayAddress, ackBuf)
        if (ack == -1010) {      // If returned value back is -1010, there is no display so show error message
            basic.showString("ERROR - no display")
        }
        else {   // Start initalising the display
            writeOneByte(0xAE)              // SSD1306_DISPLAYOFF
            writeOneByte(0xA4)              // SSD1306_DISPLAYALLON_RESUME
            writeTwoByte(0xD5, 0xF0)        // SSD1306_SETDISPLAYCLOCKDIV
            writeTwoByte(0xA8, 0x3F)        // SSD1306_SETMULTIPLEX
            writeTwoByte(0xD3, 0x00)        // SSD1306_SETDISPLAYOFFSET
            writeOneByte(0 | 0x0)           // line #SSD1306_SETSTARTLINE
            writeTwoByte(0x8D, 0x14)        // SSD1306_CHARGEPUMP
            writeTwoByte(0x20, 0x00)        // SSD1306_MEMORYMODE
            writeThreeByte(0x21, 0, 127)    // SSD1306_COLUMNADDR
            writeThreeByte(0x22, 0, 63)     // SSD1306_PAGEADDR
            writeOneByte(0xa0 | 0x1)        // SSD1306_SEGREMAP
            writeOneByte(0xc8)              // SSD1306_COMSCANDEC
            writeTwoByte(0xDA, 0x12)        // SSD1306_SETCOMPINS
            writeTwoByte(0x81, 0xCF)        // SSD1306_SETCONTRAST
            writeTwoByte(0xd9, 0xF1)        // SSD1306_SETPRECHARGE
            writeTwoByte(0xDB, 0x40)        // SSD1306_SETVCOMDETECT
            writeOneByte(0xA6)              // SSD1306_NORMALDISPLAY
            writeTwoByte(0xD6, 0)           // Zoom is set to off
            writeOneByte(0xAF)              // SSD1306_DISPLAYON
            initialised = 1
            clear()
        }
    }

    /**
     * Using (x, y) coordinates, turn on a selected pixel on the screen.
     * @param x is the X axis value, eg: 0
     * @param y is the Y axis value, eg: 0
     * @param screen is screen selection when using multiple screens
     */
    //% blockId="kitronik_air_quality_set_pixel" block="show pixel at x %x|y %y"
    //% subcategory="Display"
    //% group="Show"
    //% weight=70 blockGap=8
    //% x.min=0, x.max=127
    //% y.min=0, y.max=63
    //% inlineInputMode=inline
    export function setPixel(x: number, y: number, screen?: 1) {
        displayAddress = setScreenAddr(screen)
        if (initialised == 0) {
            initDisplay()
        }

        let page = y >> 3
        let shift_page = y % 8                                  // Calculate the page to write to
        let ind = x + page * 128 + 1                            // Calculate which register in the page to write to
        let screenPixel = (screenBuf[ind] | (1 << shift_page))  // Set the screen data byte
        screenBuf[ind] = screenPixel                            // Store data in screen buffer
        set_pos(x, page)                                        // Set the position on the screen to write at 
        writeOneByteBuf[0] = 0x40                               // Load buffer with command
        writeOneByteBuf[1] = screenPixel                        // Load buffer with byte
        pins.i2cWriteBuffer(displayAddress, writeOneByteBuf)    // Send data to screen
    }

    /**
     * Using the (x, y) coordinates, clear a selected pixel on the screen.
     * @param x is the X axis value, eg: 0
     * @param y is the Y axis value, eg: 0
     * @param screen is screen selection when using multiple screens
     */
    //% blockId="kitronik_air_quality_clear_pixel" block="clear pixel at x %x|y %y"
    //% subcategory="Display"
    //% group="Delete"
    //% weight=70 blockGap=8
    //% x.min=0, x.max=127
    //% y.min=0, y.max=63
    //% inlineInputMode=inline
    export function clearPixel(x: number, y: number, screen?: 1) {
        displayAddress = setScreenAddr(screen)
        if (initialised == 0) {
            initDisplay(1)
        }

        let page2 = y >> 3
        let shift_page2 = y % 8                                     // Calculate the page to write to
        let ind2 = x + page2 * 128 + 1                              // Calculate which register in the page to write to
        let screenPixel2 = clearBit(screenBuf[ind2], shift_page2)   // Clear the screen data byte
        screenBuf[ind2] = screenPixel2                              // Store data in screen buffer
        set_pos(x, page2)                                           // Set the position on the screen to write at 
        writeOneByteBuf[0] = 0x40                                   // Load buffer with command
        writeOneByteBuf[1] = screenPixel2                           // Load buffer with byte
        pins.i2cWriteBuffer(displayAddress, writeOneByteBuf)        // Send data to screen
    }

    /**
     * 'show' allows any number, string or variable to be displayed on the screen.
     * The block is expandable to set the line and alignment.
     * @param displayShowAlign is the alignment of the text, this can be left, centre or right
     * @param line is line the text to be started on, eg: 1
     * @param inputData is the text will be show
     * @param screen is screen selection when using multiple screens
     */
    //% blockId="kitronik_air_quality_show" block="show %s|| on line %line| with alignment: %displayShowAlign"
    //% weight=80 blockGap=8
    //% subcategory="Display"
    //% group="Show"
    //% expandableArgumentMode="enable"
    //% inlineInputMode=inline
    //% line.min=1 line.max=8
    export function show(inputData: any, line?: number, displayShowAlign?: ShowAlign, screen?: 1) {
        let y = 0
        let x = 0
        let inputString = convertToText(inputData)
        inputString = inputString + " "
        displayAddress = setScreenAddr(screen)
        if (initialised == 0) {
            initDisplay(1)
        }

        // If text alignment has not been specified, default to "Left"
        if (!displayShowAlign) {
            displayShowAlign = ShowAlign.Left
        }

        // If the screen line has not bee specified, default to top line (i.e. y = 0)
        // Otherwise, subtract '1' from the line number to return correct y value
        if (!line) {
            y = 0
        }
        else {
            y = (line - 1)
        }

        // Sort text into lines
        let stringArray: string[] = []
        let numberOfStrings = 0

        let previousSpacePoint = 0
        let spacePoint = 0
        let startOfString = 0
        let saveString = ""
        if (inputString.length > NUMBER_OF_CHAR_PER_LINE) {
            if (y == 7) {
                stringArray[numberOfStrings] = inputString.substr(0, (NUMBER_OF_CHAR_PER_LINE - 1))
                numberOfStrings = 1
            }
            else {
                for (let spaceFinder = 0; spaceFinder <= inputString.length; spaceFinder++) {
                    if (inputString.charAt(spaceFinder) == " ") {                                // Check whether the charector is a space, if so...
                        spacePoint = spaceFinder                                                // Remember the location of the new space found
                        if ((spacePoint - startOfString) < NUMBER_OF_CHAR_PER_LINE) {            // Check if the current location minus start of string is less than number of char on a screen
                            previousSpacePoint = spacePoint                                     // Remember that point for later
                            if (spaceFinder == (inputString.length - 1)) {
                                saveString = inputString.substr(startOfString, spacePoint)      // Cut the string from start of word to the last space and store it
                                stringArray[numberOfStrings] = saveString
                                numberOfStrings += 1
                            }
                        }
                        else if ((spacePoint - startOfString) > NUMBER_OF_CHAR_PER_LINE) {       // Check if the current location minus start of string is greater than number of char on a screen
                            saveString = inputString.substr(startOfString, previousSpacePoint)  // Cut the string from start of word to the last space and store it
                            stringArray[numberOfStrings] = saveString
                            startOfString = previousSpacePoint + 1                              // Set start of new word from last space plus one position
                            numberOfStrings += 1                                                // Increase the number of strings variable
                        }
                        else if ((spacePoint - startOfString) == NUMBER_OF_CHAR_PER_LINE) {      // Check if the current location minus start of string equals than number of char on a screen
                            saveString = inputString.substr(startOfString, spacePoint)
                            stringArray[numberOfStrings] = saveString
                            startOfString = spacePoint + 1
                            previousSpacePoint = spacePoint
                            numberOfStrings += 1
                        }
                    }
                }
            }
        }
        else {
            stringArray[numberOfStrings] = inputString
            numberOfStrings += 1
        }

        let col = 0
        let charDisplayBytes = 0
        let ind = 0

        // Set text alignment, fill up the screenBuffer with data and send to the display
        for (let textLine = 0; textLine <= (numberOfStrings - 1); textLine++) {
            let displayString = stringArray[textLine]

            if (inputString.length < (NUMBER_OF_CHAR_PER_LINE - 1)) {
                if (displayShowAlign == ShowAlign.Left) {
                    x = 0
                }
                else if (displayShowAlign == ShowAlign.Centre) {
                    x = Math.round((NUMBER_OF_CHAR_PER_LINE - displayString.length) / 2)
                }
                else if (displayShowAlign == ShowAlign.Right) {
                    x = (NUMBER_OF_CHAR_PER_LINE - displayString.length - 1) + textLine
                }
            }

            for (let charOfString = 0; charOfString < displayString.length; charOfString++) {
                charDisplayBytes = font[displayString.charCodeAt(charOfString)]
                for (let k = 0; k < 5; k++) {  // 'for' loop will take byte font array and load it into the correct register, then shift to the next byte to load into the next location
                    col = 0
                    for (let l = 0; l < 5; l++) {
                        if (charDisplayBytes & (1 << (5 * k + l)))
                            col |= (1 << (l + 1))
                    }

                    ind = (x + charOfString) * 5 + y * 128 + k + 1
                    screenBuf[ind] = col
                }
            }
            set_pos(x * 5, y)                               // Set the start position to write to
            let ind02 = x * 5 + y * 128
            let buf2 = screenBuf.slice(ind02, ind + 1)
            buf2[0] = 0x40
            pins.i2cWriteBuffer(displayAddress, buf2)       // Send data to the screen
            y += 1
        }
    }

    /**
     * Clear a specific line on the screen (1 to 8).
     * @param line is line to clear, eg: 1
     * @param screen is screen selection when using multiple screens
     */
    //% blockId="kitronik_air_quality_clear_line" block="clear line %line"
    //% weight=80 blockGap=8
    //% subcategory="Display"
    //% group="Delete"
    //% expandableArgumentMode="enable"
    //% inlineInputMode=inline
    //% line.min=1 line.max=8
    export function clearLine(line: number, screen?: 1) {
        let y = 0
        let x = 0
        displayAddress = setScreenAddr(screen)
        if (initialised == 0) {
            initDisplay(1)
        }

        // Subtract '1' from the line number to return correct y value
        y = (line - 1)

        let col = 0
        let charDisplayBytes = 0
        let ind = 0

        show("                          ", line) // Write 26 spaces to the selected line to clear it
    }

    /**
     * Draw a line of a specific length in pixels, using the (x, y) coordinates as a starting point.
     * @param lineDirection is the selection of either horizontal line or vertical line
     * @param x is start position on the X axis, eg: 0
     * @param y is start position on the Y axis, eg: 0
     * @param len is the length of line, length is the number of pixels, eg: 10
     * @param screen is screen selection when using multiple screens
     */
    //% blockId="kitronik_air_quality_draw_line" block="draw a %lineDirection | line with length of %len starting at x %x|y %y"
    //% weight=72 blockGap=8
    //% subcategory="Display"
    //% group="Draw"
    //% x.min=0, x.max=127
    //% y.min=0, y.max=63
    //% len.min=1, len.max=127
    //% inlineInputMode=inline
    export function drawLine(lineDirection: LineDirectionSelection, len: number, x: number, y: number, screen?: 1) {
        if (lineDirection == LineDirectionSelection.horizontal) {
            for (let hPixel = x; hPixel < (x + len); hPixel++)      // Loop to set the pixels in the horizontal line
                setPixel(hPixel, y, screen)
        }
        else if (lineDirection == LineDirectionSelection.vertical) {
            if (len >= 64) {          // For horizontal, 'len' can be max of 127 (full x-axis), but vertical only allowed to be max of 63 (full y-axis)
                len = 63
            }
            for (let vPixel = y; vPixel < (y + len); vPixel++)      // Loop to set the pixels in the vertical line
                setPixel(x, vPixel, screen)
        }
    }

    /**
     * Draw a rectangle with a specific width and height in pixels, using the (x, y) coordinates as a starting point.
     * @param width is width of the rectangle, eg: 60
     * @param height is height of the rectangle, eg: 30
     * @param x is the start position on the X axis, eg: 0
     * @param y is the start position on the Y axis, eg: 0
     * @param screen is screen selection when using multiple screens
     */
    //% blockId="kitronik_air_quality_draw_rect" block="draw a rectangle %width|wide %height|high from position x %x|y %y"
    //% weight=71 blockGap=8
    //% subcategory="Display"
    //% group="Draw"
    //% inlineInputMode=inline
    //% width.min=1 width.max=127
    //% height.min=1 height.max=63
    //% x.min=0 x.max=127
    //% y.min=0 y.max=63
    export function drawRect(width: number, height: number, x: number, y: number, screen?: 1) {
        if (!x) {    // If variable 'x' has not been used, default to x position of 0
            x = 0
        }

        if (!y) {    // If variable 'y' has not been used, default to y position of 0
            y = 0
        }

        // Draw the lines for each side of the rectangle
        drawLine(LineDirectionSelection.horizontal, width, x, y, screen)
        drawLine(LineDirectionSelection.horizontal, width, x, ((y + height) - 1), screen)
        drawLine(LineDirectionSelection.vertical, height, x, y, screen)
        drawLine(LineDirectionSelection.vertical, height, ((x + width) - 1), y, screen)
    }

    /**
     * Clear all pixels, text and images on the screen.
     * @param screen is screen selection when using multiple screens
     */
    //% blockId="kitronik_air_quality_clear" block="clear display"
    //% subcategory="Display"
    //% group="Delete"
    //% weight=63 blockGap=8
    export function clear(screen?: number) {
        displayAddress = setScreenAddr(screen)
        if (initialised == 0) {
            initDisplay(1)
        }

        screenBuf.fill(0)       // Fill the screenBuf with all '0'
        screenBuf[0] = 0x40
        set_pos()               // Set position to the start of the screen
        pins.i2cWriteBuffer(displayAddress, screenBuf)  // Write clear buffer to the screen
    }

    /**
     * Turn the screen on and off. The information on the screen will be kept when it is off, ready to be displayed again.
     * @param displayOutput is the boolean setting for the screen, either ON or OFF
     * @param screen is screen selection when using multiple screens
     */
    //% blockId=kitronik_air_quality_display_on_off_control
    //% block="turn %displayOutput=on_off_toggle| display"
    //% subcategory="Display"
    //% group="Control"
    //% expandableArgumentMode="toggle"
    //% weight=80 blockGap=8
    export function controlDisplayOnOff(displayOutput: boolean, screen?: 1) {
        displayAddress = setScreenAddr(screen)
        if (initialised == 0) {
            initDisplay(1)
        }

        if (displayOutput == true) {
            writeOneByte(0xAF)      // Turn display output on
        }
        else {
            writeOneByte(0xAE)      // Turn display output off
        }
    }

    /**
     * Render a boolean as an on/off toggle
     */
    //% blockId=on_off_toggle
    //% block="$on"
    //% on.shadow="toggleOnOff"
    //% blockHidden=true
    export function onOff(on: boolean): boolean {
        return on;
    }


    //////////////////////////////////////
    //
    //      Plotting blocks
    //
    //////////////////////////////////////

    /**
     * Start plotting a live graph of the chosen variable or input on the screen. 
     * @param plotVariable is the variable to be recorded on a graph on the display
     * @param screen is screen selection when using multiple screens
     */
    //% blockId="kitronik_air_quality_plot_request"
    //% subcategory="Display"
    //% group="Draw"
    //% block="plot %plotVariable| onto display"
    //% weight=100 blockGap=8
    export function plot(plotVariable: number, screen?: 1) {
        displayAddress = setScreenAddr(screen)
        if (initialised == 0) {
            initDisplay(1)
        }

        let plotLength = plotArray.length
        if (plotLength == 127) {     // If the length of the array has reached the max number of pixels, shift the array and remove the oldest value
            plotArray.shift()
        }
        // Round the variable to use ints rather than floats
        plotVariable = Math.round(plotVariable)
        // Add the value to the end of the array
        plotArray.push(plotVariable)

        // If the variable exceeds the scale of the y axis, update the min or max limits
        if (plotVariable > graphYMax)
            graphYMax = plotVariable
        if (plotVariable < graphYMin)
            graphYMin = plotVariable

        // 'for' loop plots the graph on the display
        for (let arrayPosition = 0; arrayPosition <= plotLength; arrayPosition++) {
            let x3 = arrayPosition  // Start of the screen (x-axis)
            let yPlot = plotArray[arrayPosition]
            // Map the variables to scale between the min and max values to the min and max graph pixel area
            yPlot = pins.map(yPlot, graphYMin, graphYMax, GRAPH_Y_MIN_LOCATION, GRAPH_Y_MAX_LOCATION)

            if (arrayPosition == 0) {
                previousYPlot = yPlot
            }
            let y3 = 0
            let len = 0

            // Determine if the line needs to be drawn from the last point to the new or visa-versa (vertical lines can only be drawn down the screen)
            if (yPlot < previousYPlot) {
                y3 = yPlot
                len = (previousYPlot - yPlot)
            }
            else if (yPlot > previousYPlot) {
                y3 = previousYPlot
                len = (yPlot - previousYPlot)
            }
            else {
                y3 = yPlot
                len = 1
            }

            // Clear plots in screenBuffer
            let page3 = 0
            for (let pixel = GRAPH_Y_MAX_LOCATION; pixel <= GRAPH_Y_MIN_LOCATION; pixel++) {
                page3 = pixel >> 3
                let shift_page3 = pixel % 8
                let ind5 = x3 + page3 * 128 + 1
                let screenPixel3 = clearBit(screenBuf[ind5], shift_page3)   // Clear the screen data byte
                screenBuf[ind5] = screenPixel3                              // Store data in screenBuffer
            }

            // Plot new data in screenBuffer
            for (let pixel = y3; pixel < (y3 + len); pixel++) {
                page3 = pixel >> 3
                let shift_page4 = pixel % 8
                let ind6 = x3 + page3 * 128 + 1
                let screenPixel4 = (screenBuf[ind6] | (1 << shift_page4))   // Set the screen data byte
                screenBuf[ind6] = screenPixel4                              // Store data in screen buffer
            }
            previousYPlot = yPlot
        }
        refresh() // Refresh screen with new data in screenBuffer
    }


    //////////////////////////////////////
    //
    //      Expert blocks
    //
    //////////////////////////////////////

    /**
     * Update or refresh the screen if any data has been changed.
     * @param screen is screen selection when using multiple screens
     */
    //% subcategory="Display"
    //% group="Advanced"
    //% blockId="kitronik_air_quality_draw" block="refresh display"
    //% weight=63 blockGap=8
    export function refresh(screen?: 1) {
        displayAddress = setScreenAddr(screen)
        if (initialised == 0) {
            initDisplay(1)
        }

        set_pos()
        pins.i2cWriteBuffer(displayAddress, screenBuf)
    }

    /**
     * Invert the colours on the screen (black to white, white to black)
     * @param output toggles between inverting the colours of the display
     */
    //% subcategory="Display"
    //% group="Advanced"
    //% blockId="kitronik_air_quality_invert_screen" block="inverted display %output=on_off_toggle"
    //% weight=62 blockGap=8
    export function invert(output: boolean, screen?: 1) {
        let invertRegisterValue = 0
        displayAddress = setScreenAddr(screen)
        if (initialised == 0) {
            initDisplay(1)
        }

        if (output == true) {
            invertRegisterValue = 0xA7
        }
        else {
            invertRegisterValue = 0xA6
        }
        writeOneByte(invertRegisterValue)
    }

    ////////////////////////////////
    //            RTC             //
    ////////////////////////////////

    /**
     * Alarm repeat type
     */
    export enum AlarmType {
        //% block="Single"
        Single = 0,
        //% block="Daily Repeating"
        Repeating = 1
    }

    /**
     * Alarm silence type
     */
    export enum AlarmSilence {
        //% block="Auto Silence"
        autoSilence = 1,
        //% block="User Silence"
        userSilence = 2
    }

    let alarmHour = 0       //The hour setting for the alarm
    let alarmMin = 0        //The minute setting for the alarm
    export let alarmSetFlag = 0    //Flag set to '1' when an alarm is set
    let alarmRepeat = 0     //If '1' shows that the alarm should remain set so it triggers at the next time match
    let alarmOff = 0        //If '1' shows that alarm should auto switch off, if '2' the user must switch off 
    let alarmTriggered = 0  //Flag to show if the alarm has been triggered ('1') or not ('0')
    let alarmTriggerHandler: Action
    let alarmHandler: Action
    let simpleCheck = 0 //If '1' shows that the alarmHandler is not required as the check is inside an "if" statement

    /**
     * Set time on RTC, as three numbers
     * @param setHours is to set the hours
     * @param setMinutes is to set the minutes
     * @param setSeconds is to set the seconds
    */
    //% subcategory="Clock"
    //% group="Set Time"
    //% blockId=kitronik_air_quality_set_time 
    //% block="Set Time to %setHours|hrs %setMinutes|mins %setSeconds|secs"
    //% setHours.min=0 setHours.max=23
    //% setMinutes.min=0 setMinutes.max=59
    //% setSeconds.min=0 setSeconds.max=59
    //% weight=100 blockGap=8
    export function setTime(setHours: number, setMinutes: number, setSeconds: number): void {

        if (kitronik_RTC.initalised == false) {
            kitronik_RTC.secretIncantation()
        }

        let bcdHours = kitronik_RTC.decToBcd(setHours)                           //Convert number to binary coded decimal
        let bcdMinutes = kitronik_RTC.decToBcd(setMinutes)                       //Convert number to binary coded decimal
        let bcdSeconds = kitronik_RTC.decToBcd(setSeconds)                       //Convert number to binary coded decimal
        let writeBuf = pins.createBuffer(2)

        writeBuf[0] = kitronik_RTC.RTC_SECONDS_REG
        writeBuf[1] = kitronik_RTC.STOP_RTC                                  //Disable Oscillator
        pins.i2cWriteBuffer(kitronik_RTC.CHIP_ADDRESS, writeBuf, false)

        writeBuf[0] = kitronik_RTC.RTC_HOURS_REG
        writeBuf[1] = bcdHours                                      //Send new Hours value
        pins.i2cWriteBuffer(kitronik_RTC.CHIP_ADDRESS, writeBuf, false)

        writeBuf[0] = kitronik_RTC.RTC_MINUTES_REG
        writeBuf[1] = bcdMinutes                                    //Send new Minutes value
        pins.i2cWriteBuffer(kitronik_RTC.CHIP_ADDRESS, writeBuf, false)

        writeBuf[0] = kitronik_RTC.RTC_SECONDS_REG
        writeBuf[1] = kitronik_RTC.START_RTC | bcdSeconds                            //Send new seconds masked with the Enable Oscillator
        pins.i2cWriteBuffer(kitronik_RTC.CHIP_ADDRESS, writeBuf, false)
    }

    /**
     * Read time from RTC as a string
    */
    //% subcategory="Clock"
    //% group="Read Time"
    //% blockId=kitronik_air_quality_read_time 
    //% block="Read Time as String"
    //% weight=95 blockGap=8
    export function readTime(): string {

        if (kitronik_RTC.initalised == false) {
            kitronik_RTC.secretIncantation()
        }

        //read Values
        kitronik_RTC.readValue()

        let decSeconds = kitronik_RTC.bcdToDec(kitronik_RTC.currentSeconds, kitronik_RTC.RTC_SECONDS_REG)                  //Convert number to Decimal
        let decMinutes = kitronik_RTC.bcdToDec(kitronik_RTC.currentMinutes, kitronik_RTC.RTC_MINUTES_REG)                  //Convert number to Decimal
        let decHours = kitronik_RTC.bcdToDec(kitronik_RTC.currentHours, kitronik_RTC.RTC_HOURS_REG)                        //Convert number to Decimal

        //Combine hours,minutes and seconds in to one string
        let strTime: string = "" + ((decHours / 10) >> 0) + decHours % 10 + ":" + ((decMinutes / 10) >> 0) + decMinutes % 10 + ":" + ((decSeconds / 10) >> 0) + decSeconds % 10

        return strTime
    }

    /**
     * Set date on RTC as three numbers
     * @param setDay is to set the day in terms of numbers 1 to 31
     * @param setMonths is to set the month in terms of numbers 1 to 12
     * @param setYears is to set the years in terms of numbers 0 to 99
    */
    //% subcategory="Clock"
    //% group="Set Date"
    //% blockId=kitronik_air_quality_set_date 
    //% block="Set Date to %setDays|Day %setMonths|Month %setYear|Year"
    //% setDay.min=1 setDay.max=31
    //% setMonth.min=1 setMonth.max=12
    //% setYear.min=0 setYear.max=99
    //% weight=90 blockGap=8
    export function setDate(setDay: number, setMonth: number, setYear: number): void {

        if (kitronik_RTC.initalised == false) {
            kitronik_RTC.secretIncantation()
        }

        let leapYearCheck = 0
        let writeBuf = pins.createBuffer(2)
        let readBuf = pins.createBuffer(1)
        let bcdDay = 0
        let bcdMonths = 0
        let bcdYears = 0
        let readCurrentSeconds = 0

        //Check day entered does not exceed month that has 30 days in
        if ((setMonth == 4) || (setMonth == 6) || (setMonth == 9) || (setMonth == 11)) {
            if (setDay == 31) {
                setDay = 30
            }
        }

        //Leap year check and does not exceed 30 days
        if ((setMonth == 2) && (setDay >= 29)) {
            leapYearCheck = setYear % 4
            if (leapYearCheck == 0)
                setDay = 29
            else
                setDay = 28
        }

        let weekday = kitronik_RTC.calcWeekday(setDay, setMonth, (setYear + 2000))

        bcdDay = kitronik_RTC.decToBcd(setDay)                       //Convert number to binary coded decimal
        bcdMonths = kitronik_RTC.decToBcd(setMonth)                  //Convert number to binary coded decimal
        bcdYears = kitronik_RTC.decToBcd(setYear)                    //Convert number to binary coded decimal

        writeBuf[0] = kitronik_RTC.RTC_SECONDS_REG
        pins.i2cWriteBuffer(kitronik_RTC.CHIP_ADDRESS, writeBuf, false)

        readBuf = pins.i2cReadBuffer(kitronik_RTC.CHIP_ADDRESS, 1, false)
        readCurrentSeconds = readBuf[0]

        writeBuf[0] = kitronik_RTC.RTC_SECONDS_REG
        writeBuf[1] = kitronik_RTC.STOP_RTC                                  //Disable Oscillator
        pins.i2cWriteBuffer(kitronik_RTC.CHIP_ADDRESS, writeBuf, false)

        writeBuf[0] = kitronik_RTC.RTC_WEEKDAY_REG
        writeBuf[1] = weekday                                        //Send new Weekday value
        pins.i2cWriteBuffer(kitronik_RTC.CHIP_ADDRESS, writeBuf, false)

        writeBuf[0] = kitronik_RTC.RTC_DAY_REG
        writeBuf[1] = bcdDay                                        //Send new Day value
        pins.i2cWriteBuffer(kitronik_RTC.CHIP_ADDRESS, writeBuf, false)

        writeBuf[0] = kitronik_RTC.RTC_MONTH_REG
        writeBuf[1] = bcdMonths                                     //Send new Months value
        pins.i2cWriteBuffer(kitronik_RTC.CHIP_ADDRESS, writeBuf, false)

        writeBuf[0] = kitronik_RTC.RTC_YEAR_REG
        writeBuf[1] = bcdYears                                      //Send new Year value
        pins.i2cWriteBuffer(kitronik_RTC.CHIP_ADDRESS, writeBuf, false)

        writeBuf[0] = kitronik_RTC.RTC_SECONDS_REG
        writeBuf[1] = kitronik_RTC.START_RTC | readCurrentSeconds                    //Enable Oscillator
        pins.i2cWriteBuffer(kitronik_RTC.CHIP_ADDRESS, writeBuf, false)
    }

    /**
     * Read date from RTC as a string
    */
    //% subcategory="Clock"
    //% group="Read Date"
    //% blockId=kitronik_air_quality_read_date 
    //% block="Read Date as String"
    //% weight=85 blockGap=8
    export function readDate(): string {

        if (kitronik_RTC.initalised == false) {
            kitronik_RTC.secretIncantation()
        }

        //read Values
        kitronik_RTC.readValue()

        let decDay = kitronik_RTC.bcdToDec(kitronik_RTC.currentDay, kitronik_RTC.RTC_DAY_REG)                      //Convert number to Decimal
        let decMonths = kitronik_RTC.bcdToDec(kitronik_RTC.currentMonth, kitronik_RTC.RTC_MONTH_REG)               //Convert number to Decimal
        let decYears = kitronik_RTC.bcdToDec(kitronik_RTC.currentYear, kitronik_RTC.RTC_YEAR_REG)                  //Convert number to Decimal

        //let strDate: string = decDay + "/" + decMonths + "/" + decYears
        let strDate: string = "" + ((decDay / 10) >> 0) + (decDay % 10) + "/" + ((decMonths / 10) >> 0) + (decMonths % 10) + "/" + ((decYears / 10) >> 0) + (decYears % 10)
        return strDate
    }

    /**Read time parameter from RTC*/
    //% subcategory="Clock"
    //% group="Read Time"
    //% blockId=kitronik_air_quality_read_time_parameter 
    //% block="Read %selectParameter| as Number"
    //% weight=75 blockGap=8
    export function readTimeParameter(selectParameter: TimeParameter): number {

        if (kitronik_RTC.initalised == false) {
            kitronik_RTC.secretIncantation()
        }
        let decParameter = 0
        //read Values
        kitronik_RTC.readValue()

        //from enum convert the required time parameter and return
        if (selectParameter == TimeParameter.Hours) {
            decParameter = kitronik_RTC.bcdToDec(kitronik_RTC.currentHours, kitronik_RTC.RTC_HOURS_REG)                   //Convert number to Decimal
        }
        else if (selectParameter == TimeParameter.Minutes) {
            decParameter = kitronik_RTC.bcdToDec(kitronik_RTC.currentMinutes, kitronik_RTC.RTC_MINUTES_REG)                  //Convert number to Decimal
        }
        else if (selectParameter == TimeParameter.Seconds) {
            decParameter = kitronik_RTC.bcdToDec(kitronik_RTC.currentSeconds, kitronik_RTC.RTC_SECONDS_REG)                  //Convert number to Decimal
        }

        return decParameter
    }

    /**Read time parameter from RTC*/
    //% subcategory="Clock"
    //% group="Read Date"
    //% blockId=kitronik_air_quality_read_date_parameter 
    //% block="Read %selectParameter| as Number"
    //% weight=65 blockGap=8
    export function readDateParameter(selectParameter: DateParameter): number {

        if (kitronik_RTC.initalised == false) {
            kitronik_RTC.secretIncantation()
        }
        let decParameter = 0
        //read Values
        kitronik_RTC.readValue()

        //from enum convert the required time parameter and return
        if (selectParameter == DateParameter.Day) {
            decParameter = kitronik_RTC.bcdToDec(kitronik_RTC.currentDay, kitronik_RTC.RTC_DAY_REG)                   //Convert number to Decimal
        }
        else if (selectParameter == DateParameter.Month) {
            decParameter = kitronik_RTC.bcdToDec(kitronik_RTC.currentMonth, kitronik_RTC.RTC_MONTH_REG)                  //Convert number to Decimal
        }
        else if (selectParameter == DateParameter.Year) {
            decParameter = kitronik_RTC.bcdToDec(kitronik_RTC.currentYear, kitronik_RTC.RTC_YEAR_REG)                   //Convert number to Decimal
        }

        return decParameter
    }

    /**
     * Set simple alarm
     * @param alarmType determines whether the alarm repeats
     * @param hour is the alarm hour setting (24 hour)
     * @param min is the alarm minute setting
     * @param alarmSilence determines whether the alarm turns off automatically or the user turns it off
    */
    //% subcategory="Clock"
    //% group=Alarm
    //% blockId=kitronik_air_quality_simple_set_alarm 
    //% block="set %alarmType|alarm to %hour|:%min|with %alarmSilence"
    //% hour.min=0 hour.max=23
    //% min.min=0 min.max=59
    //% sec.min=0 sec.max=59
    //% inlineInputMode=inline
    //% weight=26 blockGap=8
    export function simpleAlarmSet(alarmType: AlarmType, hour: number, min: number, alarmSilence: AlarmSilence): void {
        if (kitronik_RTC.initalised == false) {
            kitronik_RTC.secretIncantation()
        }

        if (alarmType == 1) {
            alarmRepeat = 1     //Daily Repeating Alarm
        }
        else {
            alarmRepeat = 0     //Single Alarm
        }

        if (alarmSilence == 1) {
            alarmOff = 1                //Auto Silence
        }
        else if (alarmSilence == 2) {
            alarmOff = 2                //User Silence
        }

        alarmHour = hour
        alarmMin = min

        alarmSetFlag = 1

        //Set background alarm trigger check running
        control.inBackground(() => {
            while (alarmSetFlag == 1) {
                backgroundAlarmCheck()
                basic.pause(1000)
            }
        })
    }

    //Function to check if an alarm is triggered and raises the trigger event if true
    //Runs in background once an alarm is set, but only if alarmSetFlag = 1
    function backgroundAlarmCheck(): void {
        let checkHour = readTimeParameter(TimeParameter.Hours)
        let checkMin = readTimeParameter(TimeParameter.Minutes)
        if (alarmTriggered == 1 && alarmRepeat == 1) {
            if (checkMin != alarmMin) {
                alarmSetFlag = 0
                alarmTriggered = 0
                simpleAlarmSet(AlarmType.Repeating, alarmHour, alarmMin, alarmOff) //Reset the alarm after the current minute has changed
            }
        }
        if (checkHour == alarmHour && checkMin == alarmMin) {
            alarmTriggered = 1
            if (alarmOff == 1) {
                alarmSetFlag = 0
                if (simpleCheck != 1) {
                    alarmHandler() //This causes a problem for the simpleAlarmCheck() function, so only runs for onAlarmTrigger()
                }
                basic.pause(2500)
                if (alarmRepeat == 1) {
                    control.inBackground(() => {
                        checkMin = readTimeParameter(TimeParameter.Minutes)
                        while (checkMin == alarmMin) {
                            basic.pause(1000)
                            checkMin = readTimeParameter(TimeParameter.Minutes)
                        }
                        alarmTriggered = 0
                        simpleAlarmSet(AlarmType.Repeating, alarmHour, alarmMin, alarmOff) //Reset the alarm after the current minute has changed
                    })
                }
            }
            else if (alarmOff == 2) {
                if (simpleCheck != 1) {
                    alarmHandler() //This causes a problem for the simpleAlarmCheck() function, so only runs for onAlarmTrigger()
                }
            }
        }
        if (alarmTriggered == 1 && alarmOff == 2 && checkMin != alarmMin) {
            alarmSetFlag = 0
            alarmTriggered = 0
        }
    }

    /**
     * Do something if the alarm is triggered
     */
    //% subcategory="Clock"
    //% group=Alarm
    //% blockId=kitronik_air_quality_on_alarm block="on alarm trigger"
    //% weight=25 blockGap=8
    export function onAlarmTrigger(alarmTriggerHandler: Action): void {
        alarmHandler = alarmTriggerHandler
    }

    /**
     * Determine if the alarm is triggered and return a boolean
    */
    //% subcategory="Clock"
    //% group=Alarm
    //% blockId=kitronik_air_quality_simple_check_alarm 
    //% block="alarm triggered"
    //% weight=24 blockGap=8
    export function simpleAlarmCheck(): boolean {
        simpleCheck = 1 //Makes sure the alarmHandler() is not called
        let checkHour = readTimeParameter(TimeParameter.Hours)
        let checkMin = readTimeParameter(TimeParameter.Minutes)
        if (alarmSetFlag == 1 && checkHour == alarmHour && checkMin == alarmMin) {
            if (alarmOff == 1) {
                control.inBackground(() => {
                    basic.pause(2500)
                    alarmSetFlag = 0
                })
            }
            return true
        }
        else {
            return false
        }
    }

    /**
     * Turn off the alarm
    */
    //% subcategory="Clock"
    //% group=Alarm
    //% blockId=kitronik_air_quality_alarm_off 
    //% block="turn off alarm"
    //% weight=23 blockGap=8
    export function simpleAlarmOff(): void {
        alarmSetFlag = 0
        if (alarmTriggered == 1 && alarmRepeat == 1) {
            control.inBackground(() => {
                let checkMin = readTimeParameter(TimeParameter.Minutes)
                while (checkMin == alarmMin) {
                    basic.pause(1000)
                    checkMin = readTimeParameter(TimeParameter.Minutes)
                }
                alarmTriggered = 0
                simpleAlarmSet(AlarmType.Repeating, alarmHour, alarmMin, alarmOff) //Reset the alarm after the current minute has changed
            })
        }
    }

    ////////////////////////////////
    //          BME688            //
    ////////////////////////////////
    
    //List of different temperature units
    export enum TemperatureUnitList {
        //% block="°C"
        C,
        //% block="°F"
        F
    }

    //List of different pressure units
    export enum PressureUnitList {
        //% block="Pa"
        Pa,
        //% block="mBar"
        mBar
    }

    /**
    * Setup the gas sensor (defaults are 300°C and 150ms).
    * Expand the block to set a specific target temperature (200 - 400°C) and 'on-time' duration (0 - 4032ms).
    * @param targetTemp is the target temperature for the gas sensor plate to reach (200 - 400°C), eg: 300
    * @param heatDuration is the length of time for the heater to be turned on (0 - 4032ms), eg: 150
    */
    //% subcategory="Sensors"
    //% group="Setup"
    //% blockId=kitronik_air_quality_setup_gas_sensor
    //% block="setup gas sensor||: temperature %targetTemp|°C, duration %heatDuration|ms"
    //% weight=100 blockGap=8
    //% targetTemp.min = 200 targetTemp.max = 400
    //% heatDuration.min = 0 heatDuration.max = 4032
    export function setupGasSensor(targetTemp?: number, heatDuration?: number): void {
        BME688.initGasSensor(targetTemp, heatDuration)
    }

    /**
    * Run all measurements on the BME688: Temperature, Pressure, Humidity & Gas Resistance.
    */
    //% subcategory="Sensors"
    //% group="Measure"
    //% blockId=kitronik_air_quality_bme688_measure_all
    //% block="measure all data readings"
    //% weight=100 blockGap=8
    export function measureData(): void {
        BME688.measureData()
    }

    // A baseline gas resistance is required for the IAQ calculation - it should be taken in a well ventilated area without obvious air pollutants
    // Take 60 readings over a ~5min period and find the mean
    /**
    * Establish the baseline gas resistance reading and the ambient temperature.
    * These values are required for air quality calculations
    */
    //% subcategory="Sensors"
    //% group="Setup"
    //% blockId=kitronik_air_quality_establish_baselines
    //% block="establish gas baseline & ambient temperature"
    //% weight=85 blockGap=8
    export function calcBaselines(): void {
        BME688.calcBaselines()
    }

    /**
    * Read Temperature from sensor as a Number.
    * Units for temperature are in °C (Celsius) or °F (Fahrenheit) according to selection.
    */
    //% subcategory="Sensors"
    //% group="Climate"
    //% blockId="kitronik_air_quality_read_temperature"
    //% block="Read Temperature in %temperature_unit"
    //% weight=100 blockGap=8
    export function readTemperature(temperature_unit: TemperatureUnitList): number {
        let temperature = BME688.temperatureReading
        // Change temperature from °C to °F if user selection requires it
        if (temperature_unit == TemperatureUnitList.F) {
            temperature = ((temperature * 18) + 320) / 10
        }

        return temperature
    }

    /**
    * Read Pressure from sensor as a Number.
    * Units for pressure are in Pa (Pascals) or mBar (millibar) according to selection.
    */
    //% subcategory="Sensors"
    //% group="Climate"
    //% blockId="kitronik_air_quality_read_pressure"
    //% block="Read Pressure in %pressure_unit"
    //% weight=95 blockGap=8
    export function readPressure(pressure_unit: PressureUnitList): number {
        let pressure = BME688.pressureReading
        //Change pressure from Pascals to millibar if user selection requires it
        if (pressure_unit == PressureUnitList.mBar)
            pressure = pressure / 100

        return pressure
    }

    /**
    * Read Humidity from sensor as a Number.
    * Humidity is output as a percentage.
    */
    //% subcategory="Sensors"
    //% group="Climate"
    //% blockId="kitronik_air_quality_read_humidity"
    //% block="Read Humidity"
    //% weight=80 blockGap=8
    export function readHumidity(): number {
        return BME688.humidityReading
    }

    /**
    * Read Gas Resistance from sensor as a Number.
    * Units for gas resistance are in Ohms.
    */
    //% subcategory="Sensors"
    //% group="Air Quality"
    //% blockId="kitronik_air_quality_read_gas_resistance"
    //% block="Read Gas Resistance"
    //% weight=50 blockGap=8
    export function readGasRes(): number {
        if (BME688.gasInit == false) {
            clear()
            show("ERROR", 3, ShowAlign.Centre)
            show("Gas Sensor not setup!", 5, ShowAlign.Centre)
            return 0
        }

        return BME688.gasResistance
    }

    /**
    * Read eCO2 from sensor as a Number (250 - 40000+ppm).
    * Units for eCO2 are in ppm (parts per million).
    */
    //% subcategory="Sensors"
    //% group="Air Quality"
    //% blockId="kitronik_air_quality_read_eCO2"
    //% block="Read eCO2"
    //% weight=95 blockGap=8
    export function readeCO2(): number {
        if (BME688.gasInit == false) {
            clear()
            show("ERROR", 3, ShowAlign.Centre)
            show("Gas Sensor not setup!", 5, ShowAlign.Centre)
            return 0
        }
        BME688.calcIAQ()
        BME688.calcCO2()

        let eCO2 = BME688.eCO2Value

        return eCO2
    }

    /**
    * Return the Air Quality rating as a percentage (0% = Bad, 100% = Excellent).
    */
    //% subcategory="Sensors"
    //% group="Air Quality"
    //% blockId=kitronik_air_quality_iaq_percent
    //% block="get IAQ \\%"
    //% weight=85 blockGap=8
    export function getAirQualityPercent(): number {
        if (BME688.gasInit == false) {
            clear()
            show("ERROR", 3, ShowAlign.Centre)
            show("Gas Sensor not setup!", 5, ShowAlign.Centre)
            return 0
        }
        BME688.calcIAQ()

        return BME688.iaqPercent
    }

    /**
    * Return the Air Quality rating as an IAQ score (500 = Bad, 0 = Excellent).
    * These values are based on the BME688 datasheet, Page 11, Table 6.
    */
    //% subcategory="Sensors"
    //% group="Air Quality"
    //% blockId=kitronik_air_quality_iaq_score
    //% block="get IAQ Score"
    //% weight=100 blockGap=8
    export function getAirQualityScore(): number {
        if (BME688.gasInit == false) {
            clear()
            show("ERROR", 3, ShowAlign.Centre)
            show("Gas Sensor not setup!", 5, ShowAlign.Centre)
            return 0
        }
        BME688.calcIAQ()

        return BME688.iaqScore
    }

    /**
    * Return the Air Quality rating as a text-based categorisation.
    * These values are based on the BME688 datasheet, Page 11, Table 6.
    */
    //% subcategory="Sensors"
    //% group="Air Quality"
    //% blockId=kitronik_air_quality_iaq_text
    //% block="get air quality category"
    //% weight=90 blockGap=8
    export function getAirQualityText(): string {
        if (BME688.gasInit == false) {
            clear()
            show("ERROR", 3, ShowAlign.Centre)
            show("Gas Sensor not setup!", 5, ShowAlign.Centre)
            return "NULL"
        }
        BME688.calcIAQ()

        return BME688.airQualityRating
    }

    ////////////////////////////////
    //     PIN INPUT/OUTPUTS      //
    ////////////////////////////////

    /**
     * General IO pin type
     */
    export enum PinType {
        //% block=Analog
        analog = 0,
        //% block=Digital
        digital = 1
    }

    /**
     * General IO pins
     */
    export enum IOPins {
        //% block=P0
        p0 = 0,
        //% block=P1
        p1 = 1,
        //% block=P2
        p2 = 2
    }

    /**
     * Read value from IO pins, either Digital or Analog
     * @param readType is either Digital or Analog
     * @param pin which IO pin to read
     */
    //% subcategory="Inputs/Outputs"
    //% group="General Inputs/Outputs"
    //% blockId=kitronik_air_quality_read_io_pins 
    //% block="%readType|read %pin"
    //% weight=95 blockGap=8
    export function readIOPin(readType: kitronik_air_quality.PinType, pin: kitronik_air_quality.IOPins): number {
        let readValue = 0
        if (pin == 0) {
            if (readType == 0) {
                readValue = pins.analogReadPin(AnalogPin.P0)
            }
            else if (readType == 1) {
                readValue = pins.digitalReadPin(DigitalPin.P0)
            }
        }
        else if (pin == 1) {
            if (readType == 0) {
                readValue = pins.analogReadPin(AnalogPin.P1)
            }
            else if (readType == 1) {
                readValue = pins.digitalReadPin(DigitalPin.P1)
            }
        }
        else if (pin == 2) {
            if (readType == 0) {
                readValue = pins.analogReadPin(AnalogPin.P2)
            }
            else if (readType == 1) {
                readValue = pins.digitalReadPin(DigitalPin.P2)
            }
        }

        return readValue
    }

    /**
     * Digital write value to IO pins
     * @param pin which IO pin to read
     * @param value to write to the pin, eg: 0
     */
    //% subcategory="Inputs/Outputs"
    //% group="General Inputs/Outputs"
    //% blockId=kitronik_air_quality_digital_write_io_pins 
    //% block="digital write pin %pin|to %value"
    //% value.min=0 value.max=1
    //% weight=90 blockGap=8
    export function digitalWriteIOPin(pin: kitronik_air_quality.IOPins, value: number): void {
        if (pin == 0) {
            pins.digitalWritePin(DigitalPin.P0, value)
        }
        else if (pin == 1) {
            pins.digitalWritePin(DigitalPin.P1, value)
        }
        else if (pin == 2) {
            pins.digitalWritePin(DigitalPin.P2, value)
        }
    }

    /**
     * Analog write value to IO pins
     * @param pin which IO pin to read
     * @param value to write to the pin, eg: 1023
     */
    //% subcategory="Inputs/Outputs"
    //% group="General Inputs/Outputs"
    //% blockId=kitronik_air_quality_analog_write_io_pins 
    //% block="analog write pin %pin|to %value"
    //% value.min=0 value.max=1023
    //% weight=85 blockGap=8
    export function analogWriteIOPin(pin: kitronik_air_quality.IOPins, value: number): void {
        if (pin == 0) {
            pins.analogWritePin(AnalogPin.P0, value)
        }
        else if (pin == 1) {
            pins.analogWritePin(AnalogPin.P1, value)
        }
        else if (pin == 2) {
            pins.analogWritePin(AnalogPin.P2, value)
        }
    }

    ////////////////////////////////
    //           EEPROM           //
    ////////////////////////////////
    
    /**
     * Write a single byte to a specified address
     * @param data is the data which will be written (a single byte)
     * @param addr is the EEPROM address, eg: 0
     */
    //% subcategory="Memory"
    //% group="Write"
    //% blockId=kitronik_air_quality_mem_write_byte 
    //% block="write byte %data|to memory address %addr"
    //% weight=100 blockGap=8
    //% addr.min=3072 addr.max=131071
    //% blockHidden = true
    export function writeByte(data: any, addr: number): void {
        EEPROM.writeByte(data, addr)
    }

    /**
     * Page Write
     * @param data is the data which will be written (up to 256 bytes)
     * @param page is the the EEPROM page to write the data to, eg: 0
     */
    //% subcategory="Memory"
    //% group="Write"
    //% blockId=kitronik_air_quality_mem_write_page 
    //% block="write %data|to memory page %page"
    //% weight=100 blockGap=8
    //% page.min=12 addr.max=511
    //% blockHidden = true
    export function writePage(data: string, page: number): void {
        EEPROM.writePage(data, page)
    }

    /**
     * Read a single byte from a specified address
     * @param addr is EEPROM address, eg: 0
     */
    //% subcategory="Memory"
    //% group="Read"
    //% blockId=kitronik_air_quality_mem_read_byte
    //% block="read byte from memory address %addr"
    //% weight=99 blockGap=8
    //% addr.min=0 addr.max=131071
    //% blockHidden = true
    export function readByte(addr: number): number {
        EEPROM.readByte(addr)
    }

    ////////////////////////////////
    //       DATA LOGGING         //
    ////////////////////////////////

    let NONE = 0
    let USB = 1

    let delimiter = " "

    let incDate = false
    let incTime = false
    let incTemp = false
    let incPress = false
    let incHumid = false
    let incIAQ = false
    let incCO2 = false
    let incLight = false

    let tUnit = 0
    let pUnit = 0

    let logDate = ""
    let logTime = ""
    let logTemp = 0
    let logPress = 0
    let logHumid = 0
    let logIAQ = 0
    let logCO2 = 0
    let logLight = 0

    let dataEntry = ""
    let firstDataBlock = 24
    let entryNum = 0
    let writeTitles = false
    let dataFull = false

    let storedList: string[] = []
    let entryNumber = false
    let listLimit = 100
    let comms = NONE
    let entryBuild = ""
    let titleBuild = ""

    export enum ListNumber {
        //% block="Send"
        Send,
        //% block="Don't Send"
        DontSend
    }

    export enum Separator {
        //% block="Tab"
        tab,
        //% block="Semicolon"
        semicolon,
        //% block="Comma"
        comma,
        //% block="Space"
        space
    }

    /**
     * Set the output of logged data to the micro:bit USB (default baudrate is 115200).
     */
    //% subcategory="Data Logging"
    //% group=Setup
    //% weight=100 blockGap=8
    //% blockId=kitronik_air_quality_output_to_usb
    //% block="set data output to micro:bit USB"
    export function setDataForUSB() {
        comms = USB
        serial.redirectToUSB()
    }

    /**
     * Choice of which character to put between each data entry (the default is a space).
     * @param charSelect is the choice of character to separate each entry in the log
     */
    //% subcategory="Data Logging"
    //% group=Setup
    //% weight=95 blockGap=8
    //% blockId=kitronik_air_quality_select_separator
    //% block="separate entries with %charSelect"
    export function selectSeparator(charSelect: Separator): void {
        if (charSelect == Separator.tab)
            delimiter = "\t"
        else if (charSelect == Separator.semicolon)
            delimiter = ";"
        else if (charSelect == Separator.comma)
            delimiter = ","
        else if (charSelect == Separator.space)
            delimiter = " "
    }

    /**
     * Include the date in the data logging output.
     */
    //% subcategory="Data Logging"
    //% group="Setup"
    //% weight=90 blockGap=8
    //% blockId=kitronik_air_quality_include_date
    //% block="include Date"
    export function includeDate() {
        incDate = true
    }

    /**
     * Include the time in the data logging output.
     */
    //% subcategory="Data Logging"
    //% group="Setup"
    //% weight=89 blockGap=8
    //% blockId=kitronik_air_quality_include_time
    //% block="include Time"
    export function includeTime() {
        incTime = true
    }

    /**
     * Include the temperature in the data logging output.
     * @param tempUnit is in °C (Celsius) or °F (Fahrenheit) according to selection
     */
    //% subcategory="Data Logging"
    //% group="Setup"
    //% weight=88 blockGap=8
    //% blockId=kitronik_air_quality_include_temperature
    //% block="include Temperature in %tempUnit"
    export function includeTemperature(tempUnit: TemperatureUnitList) {
        tUnit = tempUnit
        incTemp = true
    }

    /**
     * Include the presure in the data logging output.
     * @param presUnit is in Pa (Pascals) or mBar (millibar) according to selection
     */
    //% subcategory="Data Logging"
    //% group="Setup"
    //% weight=87 blockGap=8
    //% blockId=kitronik_air_quality_include_pressure
    //% block="include Pressure in %presUnit"
    export function includePressure(presUnit: PressureUnitList) {
        pUnit = presUnit
        incPress = true
    }

    /**
     * Include the humidity in the data logging output.
     */
    //% subcategory="Data Logging"
    //% group="Setup"
    //% weight=86 blockGap=8
    //% blockId=kitronik_air_quality_include_humidity
    //% block="include Humidity"
    export function includeHumidity() {
        incHumid = true
    }

    /**
     * Include the IAQ score in the data logging output.
     */
    //% subcategory="Data Logging"
    //% group="Setup"
    //% weight=85 blockGap=8
    //% blockId=kitronik_air_quality_include_iaq
    //% block="include IAQ Score"
    export function includeIAQ() {
        incIAQ = true
    }

    /**
     * Include the eCO2 in the data logging output.
     */
    //% subcategory="Data Logging"
    //% group="Setup"
    //% weight=84 blockGap=8
    //% blockId=kitronik_air_quality_include_eco2
    //% block="include eCO2"
    export function includeCO2() {
        incCO2 = true
    }

    /**
     * Include the light level in the data logging output (micro:bit LEDs cannot be used if this block is included).
     */
    //% subcategory="Data Logging"
    //% group="Setup"
    //% weight=83 blockGap=8
    //% blockId=kitronik_air_quality_include_light
    //% block="include Light Level"
    export function includeLight() {
        incLight = true
    }

    // Store the Kitronik Header and standard data column headings in the reserved metadata EEPROM blocks
    function storeTitles(): void {
        let kitronikHeader = "Kitronik Data Logger - Air Quality & Environmental Board - www.kitronik.co.uk\r\n"
        EEPROM.writeBlock(kitronikHeader, 21)

        let headings = ""

        if (incDate) {
            headings = headings + "Date" + delimiter
        }
        if (incTime) {
            headings = headings + "Time" + delimiter
        }
        if (incTemp) {
            headings = headings + "Temperature" + delimiter
        }
        if (incPress) {
            headings = headings + "Pressure" + delimiter
        }
        if (incHumid) {
            headings = headings + "Humidity" + delimiter
        }
        if (incIAQ) {
            headings = headings + "IAQ Score" + delimiter
        }
        if (incCO2) {
            headings = headings + "eCO2" + delimiter
        }
        if (incLight) {
            headings = headings + "Light" + delimiter
        }

        headings = headings + "\r\n"
        EEPROM.writeBlock(headings, 23)

        writeTitles = true
    }

    /**
     * Input information about the user and project in string format.
     * @param name of person carrying out data logging
     * @param subject area of the data logging project
     * @param year group of person carrying data logging (if school project)
     * @param group of person carrying data logging (if school project)
     */
    //% subcategory="Data Logging"
    //% group="Setup"
    //% weight=80 blockGap=8
    //% blockId=kitronik_air_quality_project_info
    //% block="add project info: Name %name||Subject %subject| Year %year| Class %group"
    //% expandableArgumentMode="enabled" 
    //% inlineInputMode=inline
    export function addProjectInfo(name: string, subject?: string, year?: string, group?: string): void {
        if (comms == NONE) {
            setDataForUSB()
        }

        let projectInfo = "Name: " + name + "\r\n"
        if (subject != "") {
            projectInfo = projectInfo + "Subject: " + subject + "\r\n"
        }
        if (year != "") {
            projectInfo = projectInfo + "Year: " + year + "\r\n"
        }
        if (group != "") {
            projectInfo = projectInfo + "Class: " + group + "\r\n"
        }

        EEPROM.writeBlock(projectInfo, 22)
    }

    /**
     * Captures and logs the data requested with the "include" blocks.
     */
    //% subcategory="Data Logging"
    //% group="Add Data"
    //% weight=100 blockGap=8
    //% blockId=kitronik_air_quality_log_data
    //% block="log data"
    export function logData(): void {
        if (writeTitles == false) {
            storeTitles()
        }

        logDate = readDate()
        logTime = readTime()
        logTemp = readTemperature(tUnit)
        logPress = readPressure(pUnit)
        logHumid = humidityReading
        logIAQ = iaqScore
        logCO2 = eCO2Value
        logLight = input.lightLevel()

        if (incDate) {
            dataEntry = dataEntry + readDate() + delimiter
        }
        if (incTime) {
            dataEntry = dataEntry + logTime + delimiter
        }
        if (incTemp) {
            dataEntry = dataEntry + logTemp + delimiter
        }
        if (incPress) {
            dataEntry = dataEntry + logPress + delimiter
        }
        if (incHumid) {
            dataEntry = dataEntry + logHumid + delimiter
        }
        if (incIAQ) {
            dataEntry = dataEntry + logIAQ + delimiter
        }
        if (incCO2) {
            dataEntry = dataEntry + logCO2 + delimiter
        }
        if (incLight) {
            dataEntry = dataEntry + logLight + delimiter
        }

        EEPROM.writeBlock(dataEntry + "\r\n", firstDataBlock + entryNum)

        let entryNum_H = entryNum >> 8
        let entryNum_L = entryNum & 0xFF

        EEPROM.writeByte(entryNum_H, (12 * 128))           // Store the current entry number at first bytes of block 12
        EEPROM.writeByte(entryNum_L, ((12 * 128) + 1))

        if (entryNum == 999) {
            dataFull = true
            entryNum = 0
        }
        else {
            entryNum++
        }
    }

    /**
     * Erases all data stored on the EEPROM by writing all bytes to 0xFF (does not erase reserved area).
     */
    //% subcategory="Data Logging"
    //% group="Add Data"
    //% weight=70 blockGap=8
    //% blockId=kitronik_air_quality_erase_data
    //% block="erase all data"
    export function eraseData(): void {
        let progress = 0
        show("Erasing Memory...", 2, ShowAlign.Centre)
        for (let addr = (firstDataBlock * 128); addr < 131072; addr++) {
            progress = Math.round((addr / 131072) * 100)
            EEPROM.writeByte(0xFF, addr)
        }
        clear()
        show("Memory Erase Complete", 2, ShowAlign.Centre)
        basic.pause(2500)
        clear()
    }

    /**
     * Send all the stored data via comms selected
     * Maximum of 1000 data entries stored
     */
    //% subcategory="Data Logging"
    //% group="Transfer"
    //% weight=65 blockGap=8
    //% blockId=kitronik_air_quality_send_all
    //% block="transmit all data"
    export function sendAllData(): void {
        if (comms == NONE) {
            setDataForUSB()
        }

        let block = firstDataBlock
        let lastEntry = 0
        let header = ""
        let info = ""
        let titles = ""
        let data = ""

        header = EEPROM.readBlock(21)
        serial.writeString(header)      // Send Kitronik Header
        info = EEPROM.readBlock(22)
        serial.writeString(info)        // Send Project Info
        titles = EEPROM.readBlock(23)
        serial.writeString(titles)      // Send Data Column Headings

        if (dataFull) {
            for (block = firstDataBlock; block < 1024; block++) {
                data = EEPROM.readBlock(block)
                serial.writeString(data)
            }
        }
        else {
            lastEntry = (EEPROM.readByte(12 * 128) << 8) | (EEPROM.readByte((12 * 128) + 1))
            for (block = firstDataBlock; block < (firstDataBlock + lastEntry); block++) {
                data = EEPROM.readBlock(block)
                serial.writeString(data)
            }
        }
    }
}
