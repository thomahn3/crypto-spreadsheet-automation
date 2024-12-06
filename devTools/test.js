// Original array
const arr = [
  [
    '5viJgMht2AGC1V153oamFHvCbn9qoTgc4oaBqsVFdmuFwfkmbHWxBXoRwfrgJFSYqyeGnRcWT2WvbhWpz8V3Cijp'
  ],
  [
    '4tBgdSYCBNrv7E2sTuBXcfijhFZeqLFE2MGw3vYi5NZuG6hM1t5Chanhkxwqc9JwB5SbW9cS8TFGtHVYP5Yvn82Z'
  ],
  [
    '2psvMyzbXQYa83VCLbGfy5Rzb3HZhWtnGFrZGnvgeXb9CcrFmWiBwAh6FzCAPUNJTFmZUFubEkKYpWQtByXhZXW2'
  ],
  [
    '57oMGi1qoHynV6a9cXgyNuHaVTgLCPny5eEi255m793FyTAiZQs2R4B7QdWrgr6CCeo2G6eGxpFUqiEDYJ5NAK3E'
  ],
  [
    '5jZ74sTkrzJ4PvusWym2pHLPPKFqyiAxtW1qtb7WjjemYjxYZ6T67ocXewZGu3KTC2FHcS7ag76H1Z2KydxHkD6V'
  ],
  [
    '3ZesJTnZNyAW7tFAmgeCWnRsDad9EYYQwowZvxmedGHbNpwGabm5H3GAXKM3Mf9vf1YstX3EySsMgbE5ro4akSbo'
  ],
  [
    '2dFpE8UG83R8Qi3bigfc4XnSFg74HKDCrzBcGFTby8wezCUfm6VTD4kFzqmhEhtMvEtRwsfYY5om6usBxTgsJZV9'
  ],
  [
    '4S8e4ZzB4rjVu3eCXTvU8CsUCyHutwyPa6EqZwDmjxR8V6D8ch8NX2jCuPtFf3YAYvm6QeTFbwAJaX7gbZs9iLdH, 5VwV9ZqD4MD8fCfZRaTzeu5ZUWJQ7dLY3Zy6cRo7XZ8jtbCJ1ZPnG2tN376wS4BAbgX162Xv5wFTsz6cB85Hccwn'
  ],
  [
    '3SGzmQR8sesny9qZGQZoKjC6Yn7eR26Up5d5Ke9XJ8AEpUjVZXaiRcsshuSg5fY7S4ozEJ23P79bEEZ427C2JY1H'
  ],
  [
    '2mm8S31srdb5CyQYMtqFLksXT966phMXUiUQdL9k6aPn5gVFW2QeUUAbHMauQJ1Upc2yBufwUyNXbLF67QXfQjWK'
  ],
  [
    '2knhTS2pvcYQpCuGuE7TarknBLGXGMn2HPrX7LgsKBVvzvNxTaYihCfX18WfZmwiCBhSZGPWhAorWy82anuN1Sm1, TmeYBJYf13PD2rEncXs1FUNHQ5ke9qFZ1ENLopkvtuVnucPCMZABzaMhEsobNnzN79LhMuyTXQVaMb511u3mkeW'
  ],
  [
    'TWC2wovrg5FxU96PEFjJFAnyvoZSfgChJPy2WAad4YskizZLend3Qpz4HQXQSf6qWqiEYoTNGjAHdZBwE5FmsGW'
  ],
  [
    '2v4Qxow4bfdJdAGbEscKdz7WviNjfDFpf8zMwSddikWVELJjnTVYBoevXibx9NwYgLrYfmPcswjQzUQTixHpjDxZ, 3Yt4R8nvye3tNEtc1VGn6jd9CJXU2VuBVrJ8bUnvqo3XDsG3WbnNRcJFUKRZcxQ2wu2cVvrexPwvrLtBsqvQ7JPa, 5nsE4jwLybxYgWtYixKaPESAq5YNKpDttdnZ9bD3nCYLjpNgfvjbLj3kDEGES2GtFcmFT6m46Hba91E4Xes5G1E2, 5JvHV7Jmm3MzxRUyVzK4YQo9LjdkQjimPaActuxg7M49HtdYtFByd57ve3PAzhdNTSWuAnCqXjo5DPTbXFkbApeh'
  ],
  [
    '2and2FPoc3fpZ46RXhUSFq4UQPY5mdHJZ6E23Vd9YZq2yvpCTJrSaoqsKJHCe7CzhLVHGBM3645aRnViZvCFqjH4'
  ],
  [
    '5xiXWWMoysR1MnGfwFPiaxKHBAoBRccNKWVJ2qw8tas9eGCZjpnb3o2KyKzGjL6D2X8QtEnTZjs61QdHAr82RGkx'
  ],
  [
    '5EYWENyYVbSZirxqC9933BBuf137YMBXQEGpGP43ooMqLh2b97gW1d273GDTnMvFJ7gm5vvCtG1Qjke82SVH4dhh, 2utf7wKiFdK9YQayLmwgyP3wDvms4voSGgbAZetzSdGjXDau9Qi5bZAYfETGdbEJQ2xV3U9xQhNcWn91omrTZJV9, iLMhsD77Fw4ARNSjo4aPceBmurMzTXmxNUuZouUJKGMid6KQbJepuJTJKLtXm5wkQAbcKeLT7mTLNsQjxni2PL9'
  ],
  [
    '5hVKD3WJvuw7sZN6DH1eLd54Q2D2YZ4ejkDxHyMtSDHwWzVNx5gsFwJGV9UftRy8TPiAxgdy2GXaCdUNKeXBkNSF'
  ],
  [
    'XGMj7VxTJdWtJ2TkJVadvjCNmtTKDVoB8kCEmNZh9yZZXkv3yEZwzmhKqVfuVqbZMUzcQRUnAYQTiGNkFqtyw7Z'
  ],
  [
    '4UKCmbLvMhZYmQkRKx8woXizeaZNxyh96pU5Dg4i4GcpRj6TxeqVpkSPouQwS773oqKZJa8kkCjikkn3LQyCZCVy'
  ],
  [
    '4zby61Zs6jMERx8rSUtjjWbvNazBrS2N2DR3JqKHSCYkBQAWmwxzXodDbF5Aa86CEmJJLjnMBHEaZEjCeFoUMHrV, 63hwaGxJdRbrTPQtYWgG2wXK81T5tYaRnTf7oj35DXRVSDoBRGkKH27Le8E837CWUD2KERcg1XVfcQJ4WHejquXp'
  ],
  [
    'qYRLJe8XWr6hotjAkgPpeuzh7PjnRzN3Swzss27o3YSMjmJiWVW5a3H38nKXehDW9UFnk1RvpeZT5tSTHuC6CoY'
  ],
  [
    '3RCAWVsQ1LPLY5ubT9uHXaKM9RVPn6zvze6ULQkk3z4K2aDHVpLzVUUbMLnWhzGYo1GKfGnDruCB5SjNh3zUXhgG, 3SxkN5bbbQZJuZAFbnkoKHRjVGrwtNjf1naD1tvyLj9ZM827TbiFfmxo1Ka9NaJjszCZMwZZeausTLhkz61GEM7a, 3BQU5ScpeTt2w5cWLRdP62recMDwPcqraeGyYHrTpb84qkhURNXHznDCjinRp79vLgk7vA5DvDApn7iU1KkSVCmx'
  ],
  [
    '5kWwV7Q3TcNdeExkTNJ9UsNodGce5dkf1G8GNWeQdjbKveEqH1twXXCZ3wS9xFA3RYrWAViDbFM9JgoLjQJ4WtWz'
  ],
  [
    'j7ZaeFXiUUNZRxr2xDvz5eLUsdK3An3zpqu3XaMNWhdKhC3FnMzJFooT5fZnNiEFejdEoK3wZEV9J5fVa34krtt'
  ],
  [
    '2LvBqkN6s58EuMD36uhHSqUzEPq9199txmzsiaEKoXWYHiqNKwZhVmGUZs44qEQa73zxSx7fFrvCYEVfjx4K4UY4'
  ],
  [
    '5HM4JQhY34PqeUaFREPtULTQgoxe5yYMFKtmn2TawJ9TJLXhfTmktf5Txrbmag1sbNwUcrbsHYFLKRvNdpQfmDE3, 61YFnxxxaqfGtdZ1bkjPuRxH8F1VMJrR6SQrAXmRkihp51wygooQ7NfkybnvnqeFYmAcpWB5ADADPnuKVjiHgvFi'
  ],
  [
    '4XTBg27cz4EwraPvUePfVjZvfoXQxNcf2JsoNn8zoVPRCKbmwpWF6kAzxYn9mZ28AxfdX7SvRJxkAD9tdE1icA34'
  ],
  [
    'RqkkUAHe3721ujxi6zhVjv2cY9fLGpkohaUwSxFNvanvJZptMSpXaNz113uVrBaKF98P6pouwNrwxkv2L4D5Nes, 5K6udfsAsy4ctycXu9Dw4tL3PLrtVtradTsYmDZ21ypnRupL9zqehxiSR7yofzCKuoRLkhxhq5Rzq1YW5BWLQPC5'
  ],
  [
    '5kvgqU43Dogh7sLkCi6dD5ZLJAFub8EJCWRAVPRn7pqWypKKNkuT9Uum4wVbt1xwodrNeaYwga6BRk8WXFYiUCXE'
  ],
  [
    '466hGtGLXhCu3xzTxYVBhGE6LvY4wGpH9TGCwNYfbLuKnfLB9XE1fXNQEj3wYH34f9SJozNQBzd1ScSsMLUcjQZn'
  ],
  [
    '5r8PfjmGufYT2KarMPdTp1pNSGyAYp8a6XXhFggswrEFryCD9SuQPKJZ9qS7wVTCwzeamKHQA9ejQmA6AGfZsJ99'
  ],
  [
    '4cG2TbwzP2L7LJkwphjrptTZVzWUcfEXhRnoE8XRbuVdkiMSJL2NRVXxM9j5dxCKtzrnshZUe1MTGQyNDk4MbeMM, 2pMuBsKztLGTfdbXYddzDhnrAV4DzrrFbarvzNxxdfGyHheVZSAFEizxQ5MvBYacNkF6jdUKuu8S6JLStzrYD7cJ, 9Dx4V2VtdN4xEzkJfHj6WWz85KWvvy4SHx5E7SKjArvTizbfdWSYKVu3KjjQsBva8qUE3tKXvPyuTQPbmU7aAnr, 3Qwhiz8ad2SrYC572KqMVpbJEjgbBBFaYyzBET4ZZoz3xryiuDqNcQxwLMiE1Nq1xwV8RospW156Dx4YvDMVMKCZ, 57RM2ZHWprUBjThS3q7PfhZVdowpc21GbkGRLpV2ooM3VYduCaCawEq1pdjBqBXUY2JFopNhFkNu1gP1ST9qq8ob'
  ],
  [
    '5DB585CjxcgJX3weWP32RM7PnezK1zAWBdAxUsWjFVHHUeB4sr5pnq9nZt2SsF1izQfmRGbeM31RUPGa2K5jHS4o'
  ],
  [
    '5Ms4hAD8qCPCumyXZG8DWYqY8odCLNNkKA5ecbGVpUb9TL1owJ74SssUGaEzXHFd4ENjjLm1PNzao2pxBsgVkZd2, 2deSAU8gHfJqatPphaHc63CgwWojKgisoJZJRj6sCAgQQwzyvqepyUtEfP4dnXPQ727AGwaDXiVehd5PoRcHqRUi, 5EmbhyE5sWqCfveRGkjEWjs5oPxybo8N4g2A11btok8KeCufqqzPNHqw4PbzZ5PLmu6aLMvmD1UZzPXG1grkQ26W, 5dGAzbZV5rPvGvNjpXPxP9y8fq9CszGueYh8cyrMBG23EKMa1H92zmdV8detZVG6ZtS84ZygsRJW5EzuiaowL6eK, 4sjJuxkdmu14t54CyAHmjqo1G1GfBbHSKbBQ9QqnvcKaC5zpkTi998F31afL57THAtJUwrNahUY47f4daYDrj3nn, 5QVptjey2yta7a8voZ3eBraGwjub44qXSVUSXR4XmA9gDtTCdCQ34C7ZBvsyp8gUob18KbEX8uhwLKgiwDvouPkG, 4hfEooPsVxT4GuiPKmeZUuBoo9sQ2YmirpYJvc1efvtX9Me54Ltr97DbtmU9Wzq7mrfNadwAeYduMT5TcJYtUaJ8, 3Aqx4fKZhR2SHz8UFsDJni3hpiFAVnduitnLvSmw2hPusPhG3xcigcuVMxkwWyFp3aEQiFZQW9WEauUWPMRgYGxu, XQ8qL2KHYQYb8h4xjVexeU9uEdGrvjtt8HJMwCz6bKa8VmyBYAbfrcFTsJV8Dt7WFKMM8pT6xd3qEhU9aKvbqmx, 8bsiAek9Ec7e2pW18AKV8GpGVUZWcS1ar3un8wBcDL1krmg4eMHydNxf79tX8VETfUVTQv925khErKj1SDsMJ89, 5BuTyX1Y5puRBm15YGHea6xHpaLsh5sGVojGgSSpiNQc5ZeHtUE4gkELAhxPmqhRrnMxuPSb3a9hPfV5XcAdN8Ew, 7MGArcEAAMiYKHdpqhwq66gXL7BSXzPfkvdW9nD8D4bR5KTMgoJcpqnuoHGEWTbUe3gsJVw3JSjmFFfvmyV2xbj, 5mus23vD7jbEWHxW3BjKaYku9sLvQeFr3xsX3KawjNehEjgU3iQaNKGoDhLr7p3nWksFv3hww2kKiqcuPvLJc9Au'
  ]
];

// Flatten the array and handle the comma splitting
const flattenedArray = arr.flat().flatMap(item => 
  item.includes(',') ? item.split(',').map(str => str.trim()) : [item]
);

console.log(flattenedArray);