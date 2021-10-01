limits = lambda layer: 2*(layer**2)
sublimits = dict({'s': 2, 'p': 6, 'd': 10, 'f': 14})
scripts = '¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹ ¹⁰ ¹¹ ¹² ¹³ ¹⁴'.split(' ')
print('Ghi chú: Hãy nhấn -1 nếu bạn không muốn tiếp tục!')
while True:
   e = int(input('Nhập vào số electron: ')); charge = e
   if e < 0: break
   configuration = ''
   shell_info = dict({1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0})
   sequence = '1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p, 5s, 4d, 5p, 6s, 4f, 5d, 6p, 7s, 5f, 6d, 7p'.split(', ')
   for level in sequence:
      t = level[1]; limit = sublimits[t]; layer = int(level[0]); addon = 0
      if e >= limit: addon = limit
      else: addon = e
      configuration += (level + scripts[addon-1])
      e -= addon; shell_info.update({layer: shell_info[layer]+addon})
      if e < 1:
         break
   print('Số electron: %s' % (str(charge)))
   print('Cấu hình của electron: %s' % (configuration))
   print('Các lớp electron:')
   print('  - K: %s' % (str(shell_info[1])))
   print('  - L: %s' % (str(shell_info[2])))
   print('  - M: %s' % (str(shell_info[3])))
   print('  - N: %s' % (str(shell_info[4])))
   print('  - O: %s' % (str(shell_info[5])))
   print('  - P: %s' % (str(shell_info[6])))
   print('  - Q: %s' % (str(shell_info[7])))
print('Cảm ơn đã dùng :) Mong bạn thích! Made by Đức Hải Cẽo!')
