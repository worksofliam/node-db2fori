
/**
 * Custom DES implementation. Ported from the Java JTOpen toolbox.
 * Code brought in from the dead ibmi project found on NPM.
 */

module.exports = class DES {

  /**
   * Perform DES based encryption.
   * @param {Buffer} key - The key.
   * @param {Buffer} data - The data.
   */
  static encrypt(key, data) {
    let e1 = new Buffer.alloc(65);
    e1.fill(0);
    let e2 = new Buffer.alloc(65);
    e2.fill(0);

    // expand the input string to 1 bit per byte again for the key
    for (let i = 0; i < 8; ++i) {
      e1[8 * i + 1] = (data[i] & 0x80) === 0 ? 0x30 : 0x31;
      e1[8 * i + 2] = (data[i] & 0x40) === 0 ? 0x30 : 0x31;
      e1[8 * i + 3] = (data[i] & 0x20) === 0 ? 0x30 : 0x31;
      e1[8 * i + 4] = (data[i] & 0x10) === 0 ? 0x30 : 0x31;
      e1[8 * i + 5] = (data[i] & 0x08) === 0 ? 0x30 : 0x31;
      e1[8 * i + 6] = (data[i] & 0x04) === 0 ? 0x30 : 0x31;
      e1[8 * i + 7] = (data[i] & 0x02) === 0 ? 0x30 : 0x31;
      e1[8 * i + 8] = (data[i] & 0x01) === 0 ? 0x30 : 0x31;
    }

    for (let i = 0; i < 8; ++i) {
      e2[8 * i + 1] = (key[i] & 0x80) === 0 ? 0x30 : 0x31;
      e2[8 * i + 2] = (key[i] & 0x40) === 0 ? 0x30 : 0x31;
      e2[8 * i + 3] = (key[i] & 0x20) === 0 ? 0x30 : 0x31;
      e2[8 * i + 4] = (key[i] & 0x10) === 0 ? 0x30 : 0x31;
      e2[8 * i + 5] = (key[i] & 0x08) === 0 ? 0x30 : 0x31;
      e2[8 * i + 6] = (key[i] & 0x04) === 0 ? 0x30 : 0x31;
      e2[8 * i + 7] = (key[i] & 0x02) === 0 ? 0x30 : 0x31;
      e2[8 * i + 8] = (key[i] & 0x01) === 0 ? 0x30 : 0x31;
    }

    // encryption method
    let preout = new Buffer(65); // preoutput block
    preout.fill(0);

    // temp key gen workspace
    let Cn = new Buffer(58);
    Cn.fill(0);
    // create Cn from the original key
    for (let n = 1; n <= 56; n++) {
      Cn[n] = e2[DES.PC1[n - 1]];
    }

    // rotate Cn to form C1 (still called Cn...)
    DES.lshift1(Cn);

    let key1 = new Buffer(49); // 48 bit key 1 to key 16
    key1.fill(0);
    // now Cn[] contains 56 bits for input to PC2 to generate key1
    for (let n = 1; n <= 48; n++) {
      key1[n] = Cn[DES.PC2[n - 1]];
    }

    let key2 = new Buffer(49);
    key2.fill(0);
    // now derive C2 from C1 (which is called Cn)
    DES.lshift1(Cn);
    for (let n = 1; n <= 48; n++) {
      key2[n] = Cn[DES.PC2[n - 1]];
    }

    let key3 = new Buffer(49);
    key3.fill(0);
    // now derive C3 from C2 by left shifting twice
    DES.lshift2(Cn);
    for (let n = 1; n <= 48; n++) {
      key3[n] = Cn[DES.PC2[n - 1]];
    }

    let key4 = new Buffer(49);
    key4.fill(0);
    // now derive C4 from C3 by again left shifting twice
    DES.lshift2(Cn);
    for (let n = 1; n <= 48; n++) {
      key4[n] = Cn[DES.PC2[n - 1]];
    }

    let key5 = new Buffer(49);
    key5.fill(0);
    // now derive C5 from C4 by again left shifting twice
    DES.lshift2(Cn);
    for (let n = 1; n <= 48; n++) {
      key5[n] = Cn[DES.PC2[n - 1]];
    }

    let key6 = new Buffer(49);
    key6.fill(0);
    // now derive C6 from C5 by again left shifting twice
    DES.lshift2(Cn);
    for (let n = 1; n <= 48; n++) {
      key6[n] = Cn[DES.PC2[n - 1]];
    }

    let key7 = new Buffer(49);
    key7.fill(0);
    // now derive C7 from C6 by again left shifting twice
    DES.lshift2(Cn);
    for (let n = 1; n <= 48; n++) {
      key7[n] = Cn[DES.PC2[n - 1]];
    }

    let key8 = new Buffer(49);
    key8.fill(0);
    // now derive C8 from C7 by again left shifting twice
    DES.lshift2(Cn);
    for (let n = 1; n <= 48; n++) {
      key8[n] = Cn[DES.PC2[n - 1]];
    }

    let key9 = new Buffer(49);
    key9.fill(0);
    // now derive C9 from C8 by shifting left once
    DES.lshift1(Cn);
    for (let n = 1; n <= 48; n++) {
      key9[n] = Cn[DES.PC2[n - 1]];
    }

    let key10 = new Buffer(49);
    key10.fill(0);
    // now derive C10 from C9 by again left shifting twice
    DES.lshift2(Cn);
    for (let n = 1; n <= 48; n++) {
      key10[n] = Cn[DES.PC2[n - 1]];
    }

    let key11 = new Buffer(49);
    key11.fill(0);
    // now derive C11 from C10 by again left shifting twice
    DES.lshift2(Cn);
    for (let n = 1; n <= 48; n++) {
      key11[n] = Cn[DES.PC2[n - 1]];
    }

    let key12 = new Buffer(49);
    key12.fill(0);
    // now derive C12 from C11 by again left shifting twice
    DES.lshift2(Cn);
    for (let n = 1; n <= 48; n++) {
      key12[n] = Cn[DES.PC2[n - 1]];
    }

    let key13 = new Buffer(49);
    key13.fill(0);
    // now derive C13 from C12 by again left shifting twice
    DES.lshift2(Cn);
    for (let n = 1; n <= 48; n++) {
      key13[n] = Cn[DES.PC2[n - 1]];
    }

    let key14 = new Buffer(49);
    key14.fill(0);
    // now derive C14 from C13 by again left shifting twice
    DES.lshift2(Cn);
    for (let n = 1; n <= 48; n++) {
      key14[n] = Cn[DES.PC2[n - 1]];
    }

    let key15 = new Buffer(49);
    key15.fill(0);
    // now derive C15 from C14 by again left shifting twice
    DES.lshift2(Cn);
    for (let n = 1; n <= 48; n++) {
      key15[n] = Cn[DES.PC2[n - 1]];
    }

    let key16 = new Buffer(49);
    key16.fill(0);
    // now derive C16 from C15 by again left shifting once
    DES.lshift1(Cn);
    for (let n = 1; n <= 48; n++) {
      key16[n] = Cn[DES.PC2[n - 1]];
    }

    // temp encryption workspace
    let Ln = new Buffer(33);
    Ln.fill(0);
    // ditto
    let Rn = new Buffer(33);
    Rn.fill(0);

    // perform the initial permutation and store the result in Ln and Rn
    for (let n = 1; n <= 32; n++) {
      Ln[n] = e1[DES.INITPERM[n - 1]];
      Rn[n] = e1[DES.INITPERM[n + 31]];
    }

    // run cipher to get new Ln and Rn
    DES.cipher(key1, Ln, Rn);
    DES.cipher(key2, Ln, Rn);
    DES.cipher(key3, Ln, Rn);
    DES.cipher(key4, Ln, Rn);
    DES.cipher(key5, Ln, Rn);
    DES.cipher(key6, Ln, Rn);
    DES.cipher(key7, Ln, Rn);
    DES.cipher(key8, Ln, Rn);
    DES.cipher(key9, Ln, Rn);
    DES.cipher(key10, Ln, Rn);
    DES.cipher(key11, Ln, Rn);
    DES.cipher(key12, Ln, Rn);
    DES.cipher(key13, Ln, Rn);
    DES.cipher(key14, Ln, Rn);
    DES.cipher(key15, Ln, Rn);
    DES.cipher(key16, Ln, Rn);

    // Ln and Rn are now at L16 and R16 - create preout[] by interposing them
    Rn.copy(preout, 1, 1, 33);
    Ln.copy(preout, 33, 1, 33);

    let e3 = new Buffer(65);
    e3.fill(0);
    // run preout[] through outperm to get ciphertext
    for (let n = 1; n <= 64; n++) {
      e3[n] = preout[DES.OUTPERM[n - 1]];
    }

    let encData = new Buffer(8);
    encData.fill(0);
    // compress back to 8 bits per byte
    for (let i = 0; i < 8; ++i) {
      if (e3[8 * i + 1] == 0x31) {
        encData[i] |= 0x80;
      }
      if (e3[8 * i + 2] == 0x31) {
        encData[i] |= 0x40;
      }
      if (e3[8 * i + 3] == 0x31) {
        encData[i] |= 0x20;
      }
      if (e3[8 * i + 4] == 0x31) {
        encData[i] |= 0x10;
      }
      if (e3[8 * i + 5] == 0x31) {
        encData[i] |= 0x08;
      }
      if (e3[8 * i + 6] == 0x31) {
        encData[i] |= 0x04;
      }
      if (e3[8 * i + 7] == 0x31) {
        encData[i] |= 0x02;
      }
      if (e3[8 * i + 8] == 0x31) {
        encData[i] |= 0x01;
      }
    }

    return encData;
  }

  static cipher(key, Ln, Rn) {
    let temp1 = new Buffer(49); // Rn run through E
    temp1.fill(0);
    let temp2 = new Buffer(49); // temp1 XORed with key
    temp2.fill(0);
    let temp3 = new Buffer(33); // temp2 run through S boxes
    temp3.fill(0);
    let fkn = new Buffer(33); //  f(k,n)
    fkn.fill(0);
    let si = new Array(9); // decimal input to S boxes
    let so = new Array(9); // decimal output from S boxes

    // generate temp1[] from Rn[]
    for (let n = 1; n <= 48; n++) {
      temp1[n] = Rn[DES.EPERM[n - 1]];
    }

    // XOR temp1 with key to get temp2
    for (let n = 1; n <= 48; n++) {
      temp2[n] = temp1[n] != key[n] ? 0x31 : 0x30;
    }

    // we need to get the explicit representation into a form for
    // processing the s boxes...
    si[1] = (temp2[1] == 0x31 ? 0x0020 : 0x0000) | (temp2[6] == 0x31 ? 0x0010 : 0x0000) | (temp2[2] == 0x31 ? 0x0008 : 0x0000) | (temp2[3] == 0x31 ? 0x0004 : 0x0000) | (temp2[4] == 0x31 ? 0x0002 : 0x0000) | (temp2[5] == 0x31 ? 0x0001 : 0x0000);

    si[2] = (temp2[7] == 0x31 ? 0x0020 : 0x0000) | (temp2[12] == 0x31 ? 0x0010 : 0x0000) | (temp2[8] == 0x31 ? 0x0008 : 0x0000) | (temp2[9] == 0x31 ? 0x0004 : 0x0000) | (temp2[10] == 0x31 ? 0x0002 : 0x0000) | (temp2[11] == 0x31 ? 0x0001 : 0x0000);

    si[3] = (temp2[13] == 0x31 ? 0x0020 : 0x0000) | (temp2[18] == 0x31 ? 0x0010 : 0x0000) | (temp2[14] == 0x31 ? 0x0008 : 0x0000) | (temp2[15] == 0x31 ? 0x0004 : 0x0000) | (temp2[16] == 0x31 ? 0x0002 : 0x0000) | (temp2[17] == 0x31 ? 0x0001 : 0x0000);

    si[4] = (temp2[19] == 0x31 ? 0x0020 : 0x0000) | (temp2[24] == 0x31 ? 0x0010 : 0x0000) | (temp2[20] == 0x31 ? 0x0008 : 0x0000) | (temp2[21] == 0x31 ? 0x0004 : 0x0000) | (temp2[22] == 0x31 ? 0x0002 : 0x0000) | (temp2[23] == 0x31 ? 0x0001 : 0x0000);

    si[5] = (temp2[25] == 0x31 ? 0x0020 : 0x0000) | (temp2[30] == 0x31 ? 0x0010 : 0x0000) | (temp2[26] == 0x31 ? 0x0008 : 0x0000) | (temp2[27] == 0x31 ? 0x0004 : 0x0000) | (temp2[28] == 0x31 ? 0x0002 : 0x0000) | (temp2[29] == 0x31 ? 0x0001 : 0x0000);

    si[6] = (temp2[31] == 0x31 ? 0x0020 : 0x0000) | (temp2[36] == 0x31 ? 0x0010 : 0x0000) | (temp2[32] == 0x31 ? 0x0008 : 0x0000) | (temp2[33] == 0x31 ? 0x0004 : 0x0000) | (temp2[34] == 0x31 ? 0x0002 : 0x0000) | (temp2[35] == 0x31 ? 0x0001 : 0x0000);

    si[7] = (temp2[37] == 0x31 ? 0x0020 : 0x0000) | (temp2[42] == 0x31 ? 0x0010 : 0x0000) | (temp2[38] == 0x31 ? 0x0008 : 0x0000) | (temp2[39] == 0x31 ? 0x0004 : 0x0000) | (temp2[40] == 0x31 ? 0x0002 : 0x0000) | (temp2[41] == 0x31 ? 0x0001 : 0x0000);

    si[8] = (temp2[43] == 0x31 ? 0x0020 : 0x0000) | (temp2[48] == 0x31 ? 0x0010 : 0x0000) | (temp2[44] == 0x31 ? 0x0008 : 0x0000) | (temp2[45] == 0x31 ? 0x0004 : 0x0000) | (temp2[46] == 0x31 ? 0x0002 : 0x0000) | (temp2[47] == 0x31 ? 0x0001 : 0x0000);

    // Now for the S boxes
    so[1] = DES.S1[si[1]];
    so[2] = DES.S2[si[2]];
    so[3] = DES.S3[si[3]];
    so[4] = DES.S4[si[4]];
    so[5] = DES.S5[si[5]];
    so[6] = DES.S6[si[6]];
    so[7] = DES.S7[si[7]];
    so[8] = DES.S8[si[8]];

    // That wasn't too bad.  Now to convert decimal to char hex again so[1-8] must be translated to 32 bits and stored in temp3[1-32]
    DES.dectobin(so[1], temp3, 1);
    DES.dectobin(so[2], temp3, 5);
    DES.dectobin(so[3], temp3, 9);
    DES.dectobin(so[4], temp3, 13);
    DES.dectobin(so[5], temp3, 17);
    DES.dectobin(so[6], temp3, 21);
    DES.dectobin(so[7], temp3, 25);
    DES.dectobin(so[8], temp3, 29);

    // Okay. Now temp3[] contains the data to run through P
    for (let n = 1; n <= 32; n++) {
      fkn[n] = temp3[DES.PPERM[n - 1]];
    }

    // now complete the cipher function to update Ln and Rn
    let temp = new Buffer(33); // storage for Ln during cipher function
    temp.fill(0);
    Rn.copy(temp, 1, 1, 33);
    for (let n = 1; n <= 32; n++) {
      Rn[n] = Ln[n] == fkn[n] ? 0x30 : 0x31;
    }
    temp.copy(Ln, 1, 1, 33);
  }

  static lshift1(Cn) {
    let hold = new Buffer(2);
    hold.fill(0);

    // get the two rotated bits
    hold[0] = Cn[1];
    hold[1] = Cn[29];

    // shift each position left in two 28 bit groups corresponding to Cn and Dn
    Cn.copy(Cn, 1, 2, 29);
    Cn.copy(Cn, 29, 30, 58);

    // restore the first bit of each subgroup
    Cn[28] = hold[0];
    Cn[56] = hold[1];
  }

  static lshift2(Cn) {
    let hold = new Buffer(4);
    hold.fill(0);

    hold[0] = Cn[1]; // get the four rotated bits
    hold[1] = Cn[2];
    hold[2] = Cn[29];
    hold[3] = Cn[30];

    // shift each position left in two 28 bit groups corresponding to Cn and Dn
    Cn.copy(Cn, 1, 3, 30);
    Cn.copy(Cn, 29, 31, 58);

    // restore the first bit of each subgroup
    Cn[27] = hold[0];
    Cn[28] = hold[1];
    Cn[55] = hold[2];
    Cn[56] = hold[3];
  }

  static dectobin(value, buf, offset) {
    buf[offset] = (value & 0x0008) !== 0 ? 0x31 : 0x30;
    buf[offset + 1] = (value & 0x0004) !== 0 ? 0x31 : 0x30;
    buf[offset + 2] = (value & 0x0002) !== 0 ? 0x31 : 0x30;
    buf[offset + 3] = (value & 0x0001) !== 0 ? 0x31 : 0x30;
  }

  // Permuted Choice 1
  static get PC1() {
    return [// get the 56 bits which make up C0 and D0 (combined into Cn) from the original key
    57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4];
  }

  // Permuted Choice 2
  static get PC2() {
    return [// used in generation of the 16 subkeys
    14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32];
  }

  // the initial scrambling of the input data
  static get INITPERM() {
    return [58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4, 62, 54, 46, 38, 30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8, 57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3, 61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7];
  }

  // the E function used in the cipher function
  static get EPERM() {
    return [32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13, 12, 13, 14, 15, 16, 17, 16, 17, 18, 19, 20, 21, 20, 21, 22, 23, 24, 25, 24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1];
  }

  // the inverse permutation of initperm - used on the proutput block
  static get OUTPERM() {
    return [40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31, 38, 6, 46, 14, 54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29, 36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27, 34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9, 49, 17, 57, 25];
  }

  // the P function used in cipher function
  static get PPERM() {
    return [16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10, 2, 8, 24, 14, 32, 27, 3, 9, 19, 13, 30, 6, 22, 11, 4, 25];
  }

  static get S1() {
    return [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7, 0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8, 4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0, 15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13];
  }

  static get S2() {
    return [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10, 3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5, 0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15, 13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9];
  }

  static get S3() {
    return [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8, 13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1, 13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7, 1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12];
  }

  static get S4() {
    return [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15, 13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9, 10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4, 3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14];
  }

  static get S5() {
    return [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9, 14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6, 4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14, 11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3];
  }

  static get S6() {
    return [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11, 10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8, 9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6, 4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13];
  }

  static get S7() {
    return [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1, 13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6, 1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2, 6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12];
  }

  static get S8() {
    return [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7, 1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2, 7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8, 2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11];
  }

}