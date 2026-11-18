import { IeltsExam } from '../types/exam';

export const DEFAULT_EXAMS: IeltsExam[] = [
  {
    id: 'ielts-reading-nov-18-2026',
    title: 'IELTS Academic Practice — Nov 18, 2026 (Listening + Reading + Writing)',
    category: 'Academic',
    description:
      'Đề thi tích hợp đầy đủ 3 kỹ năng (Listening 32 phút · 40 câu + Reading 60 phút · 40 câu + Writing 60 phút · Task 1 & Task 2). Hoàn thành từng phần có thể xác nhận thi tiếp hoặc tải bài thi xuống.',
    createdAt: '2026-11-18T03:59:00.000Z',
    updatedAt: '2026-11-18T04:45:00.000Z',
    reading: {
      durationSeconds: 3600,
      passages: [
        {
          id: 'nov18-passage-1',
          title: 'The Bark That Grows Back',
          subtitle: 'You should spend about 20 minutes on Questions 1–13, which are based on Reading Passage 1 below.',
          content: `For more than two thousand years, people around the western Mediterranean have been peeling the bark from one kind of tree and leaving the tree alive. The cork oak, Quercus suber, is the only species grown on a large scale for an outer bark that regenerates after it has been removed in sheets. In the Roman world its thick, spongy covering sealed storage jars, floated fishing nets and lined the soles of shoes; today it is best known as the stopper in wine bottles. Portugal and Spain together supply most of the world's cork, with smaller quantities coming from Morocco, Algeria, Tunisia, Italy and France.

The usefulness of cork lies in its structure. The bark is made up of millions of tiny dead cells, each filled with an air-like gas and coated with suberin, a waxy substance that repels water. The result is a material that is light, springy and a poor conductor of heat, and one that can be squeezed into the neck of a bottle and then expand to seal it. Because the dead cork can be separated from the living tissue beneath, which goes on producing new bark, a careful harvester can remove it without killing the tree.

A cork oak is not stripped until it is mature. The first harvest takes place when the tree is about twenty-five years old and the trunk measures at least 70 centimetres around at chest height. This initial 'virgin' cork is hard and irregular, and is ground up for flooring and insulation rather than used for bottles. The tree can be stripped again about nine years later, yielding a smoother second cork that is still not fine enough for stoppers. Only from the third harvest, when the tree is roughly forty-three years old, does the bark reach the quality that wine producers demand. From then on the tree can be harvested every nine years or so for the rest of its life, which may well exceed a century and a half.

Harvesting takes place between May and August, when the tree is growing strongly and the bark comes away from the trunk easily. The work is still done by hand. Using a sharp, short-handled axe, a skilled worker cuts a vertical line down the trunk and several horizontal cuts around it, then levers the bark away in large planks. The skill lies in cutting through the cork without scoring the living layer beneath, since a deep wound can weaken the tree or let disease in. Afterwards the exposed trunk is a vivid reddish-brown that darkens over the following months, and the last digit of the harvest year is painted on it so that nobody returns too soon.

The planks that fall to the ground are only the start of the process. They are carried to a yard and stacked in the open air for at least six months, during which sun, wind and rain stabilise the material. Next they are boiled in large vats for about an hour, which cleans them, kills insects and softens the cork so that it can be flattened. After boiling, the planks rest for several weeks in a cool, damp room until they are flat and contain the right amount of moisture for cutting. They are then sorted by thickness and quality. Strips are cut from the best planks, and stoppers are punched out of the strips with hollow tubes before being washed, inspected and graded.

Very little is wasted. The offcuts left after punching are ground into granules, which are mixed with a binder and pressed into sheets and blocks. These agglomerated products supply floor tiles, noticeboards, the cores of cricket balls, the bases of badminton shuttlecocks and insulation for buildings. Some aerospace engineers even use cork-based coatings to shield components from extreme heat.

The cork forests matter as much for what they shelter as for what they produce. The open woodlands of southern Portugal and Spain, known as montado and dehesa respectively, are home to species such as the Iberian lynx and the Spanish imperial eagle, and farmers graze pigs, sheep and cattle beneath the trees. Because a stripped tree must regrow its bark, it is thought to absorb more carbon dioxide than one left untouched, which gives owners a further reason to keep the trees standing.

Yet the industry has had to defend itself. When plastic stoppers and aluminium screw caps spread through the wine trade in the 1990s and 2000s, some growers feared that their woodlands would lose their value and be cleared for other uses. Producers responded by tightening quality control and promoting the environmental case for cork. Meanwhile, longer droughts and more frequent wildfires threaten trees that take decades to mature.`,
          questionGroups: [
            {
              id: 'nov18-p1-g1',
              title: 'Questions 1–6',
              instruction:
                'Do the following statements agree with the information given in Reading Passage 1? Choose TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, or NOT GIVEN if there is no information on this.',
              type: 'true-false-ng',
              options: ['TRUE', 'FALSE', 'NOT GIVEN'],
              questions: [
                {
                  number: 1,
                  prompt: 'No other tree species is farmed extensively for bark that grows back.',
                  answerKey: 'TRUE',
                  explanation: 'P1 đoạn 1: cork oak là loài duy nhất được trồng quy mô lớn để lấy vỏ tái sinh, tức không có loài nào khác.',
                },
                {
                  number: 2,
                  prompt: 'The Romans were the first people to use cork as a seal.',
                  answerKey: 'NOT GIVEN',
                  explanation: 'Đoạn 1 nói người La Mã dùng vỏ bần để bịt hũ, không nói họ là người đầu tiên.',
                },
                {
                  number: 3,
                  prompt: 'A cork oak can be stripped for the first time at any age, provided its trunk is wide enough.',
                  answerKey: 'FALSE',
                  explanation: 'Đoạn 3: cần khoảng 25 tuổi và chu vi thân từ 70 cm, không phải ở tuổi nào cũng được.',
                },
                {
                  number: 4,
                  prompt: "Bark from a tree's second harvest is of high enough quality to make wine stoppers.",
                  answerKey: 'FALSE',
                  explanation: 'Đoạn 3: lớp vỏ lần hai vẫn chưa đủ mịn để làm nút chai.',
                },
                {
                  number: 5,
                  prompt: 'Harvesters mark each tree to show when it was last stripped.',
                  answerKey: 'TRUE',
                  explanation: 'Đoạn 4: chữ số cuối của năm thu hoạch được sơn lên thân cây.',
                },
                {
                  number: 6,
                  prompt: 'Harvesters are paid according to the amount of cork they remove.',
                  answerKey: 'NOT GIVEN',
                  explanation: 'Không có thông tin về cách trả công.',
                },
              ],
            },
            {
              id: 'nov18-p1-g2',
              title: 'Questions 7–13',
              instruction:
                'Complete the flow chart below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer.',
              type: 'flow-chart',
              sharedPrompt: 'Cork processing: from harvested bark to finished products',
              questions: [
                {
                  number: 7,
                  stepLabel: 'Harvest',
                  prompt: 'Bark is cut with an (7) _________ and levered off',
                  answerKey: 'axe',
                  explanation: 'Đoạn 4: a sharp, short-handled axe.',
                },
                {
                  number: 8,
                  stepLabel: 'Drying',
                  prompt: 'Planks are stacked outdoors for at least (8) _________',
                  answerKey: 'six months|6 months',
                  explanation: 'Đoạn 5: stacked in the open air for at least six months.',
                },
                {
                  number: 9,
                  stepLabel: 'Boiling',
                  prompt: 'Planks are boiled in vats for about (9) _________',
                  answerKey: 'an hour|one hour|1 hour',
                  explanation: 'Đoạn 5: boiled in large vats for about an hour.',
                },
                {
                  number: 10,
                  stepLabel: 'Resting',
                  prompt: 'Planks rest for weeks in a cool, (10) _________ room',
                  answerKey: 'damp',
                  explanation: 'Đoạn 5: a cool, damp room.',
                },
                {
                  number: 11,
                  stepLabel: 'Sorting',
                  prompt: 'Planks are sorted by (11) _________ and quality',
                  answerKey: 'thickness',
                  explanation: 'Đoạn 5: sorted by thickness and quality.',
                },
                {
                  number: 12,
                  stepLabel: 'Punching',
                  prompt: 'Stoppers are punched out with hollow (12) _________',
                  answerKey: 'tubes',
                  explanation: 'Đoạn 5: punched out with hollow tubes.',
                },
                {
                  number: 13,
                  stepLabel: 'Re-using',
                  prompt: 'Offcuts become (13) _________ pressed with a binder',
                  answerKey: 'granules',
                  explanation: 'Đoạn 6: offcuts are ground into granules.',
                },
              ],
            },
          ],
        },
        {
          id: 'nov18-passage-2',
          title: 'The Return of the Sail',
          subtitle: 'You should spend about 20 minutes on Questions 14–26, which are based on Reading Passage 2 below.',
          content: `A Around eighty per cent of world trade by volume travels by sea, and almost all of it is carried by ships that burn oil-based fuel. Shipping produces roughly three per cent of global greenhouse gas emissions, and international regulators have set the goal of bringing that figure to net zero by around 2050. Switching to alternative fuels such as ammonia or methanol is one route, but those fuels are scarce and costly, and many ships would need to be rebuilt to burn them. A growing number of shipowners are therefore taking a second look at something older and free of charge: the wind.

B Sail dominated commercial shipping for thousands of years, and it did not vanish the moment steam arrived in the nineteenth century. Large steel-hulled sailing vessels were still carrying Australian grain to Europe as late as the 1940s. Steamships won out, not because they were always faster, but because they were predictable: they kept to a timetable whatever the weather, which suited merchants and insurers alike. The arrival of cheap oil in the twentieth century made the contest one-sided, and by the 1950s commercial sail had become a curiosity.

C The idea of harnessing wind without conventional sails dates from the 1920s, when the German engineer Anton Flettner fitted a ship with tall cylinders that were spun by a motor. When wind blows across a rotating cylinder, the air moves faster on one side than the other, which produces a force at right angles to the wind direction, a phenomenon known as the Magnus effect. Flettner's vessels worked, and one of them crossed the Atlantic in 1926. The economics did not: with oil cheap and engines improving, owners saw no reason to invest in an unusual rig, and the idea was largely forgotten.

[[FIGURE:rotor-sail]]

D Modern rotor sails keep Flettner's principle but little else. They are built from lightweight composite materials, spun by electric motors and controlled by software that adjusts the speed of rotation to suit the wind. Because each rotor is a self-contained tower, it can be added to an existing ship during routine maintenance rather than requiring a new hull, and rotors have been fitted to tankers, bulk carriers and ferries.

E Wing sails look less like sails than like the wings of an aircraft. Built from steel or composites, each one has an aerofoil cross-section, so that air flowing past it creates lift in the same way as it does for a plane, except that here the force pushes the ship forwards. Some designs can be lowered or folded, which lets a vessel pass beneath bridges and protects the structure in storms.

F The wind blows faster and more steadily high above the sea than at deck level, and kites are designed to take advantage of that. A large kite shaped like a paraglider is launched from the bow and flies several hundred metres up, tethered to the ship by a cable and steered by an automated control system that flies it in looping patterns. It takes up little deck space, and it can be reeled in when conditions are unsafe or the wind drops.

G Estimates of how much fuel wind-assist devices save differ widely, from a few per cent to a fifth or more, depending on the ship, the route and the season. The benefit is greatest on long ocean voyages where there are steady crosswinds, and smallest on short coastal trips. Some operators use weather-routing software that picks a course offering favourable winds, even when it is slightly longer. Yet uptake has been slower than enthusiasts hoped. Installation is expensive, and towers or wings on deck can interfere with cargo handling. There is also a financial puzzle: the shipowner who pays for an installation does not always pay for the fuel, which often falls to the charterer who hires the vessel for a voyage, so the owner has little reason to invest. In addition, some ports and bridges limit the height of ships passing beneath or alongside. Most analysts therefore expect wind to supplement engines rather than replace them, trimming the fuel bill while ships remain recognisably modern.`,
          questionGroups: [
            {
              id: 'nov18-p2-g1',
              title: 'Questions 14–18',
              instruction:
                'Reading Passage 2 has seven paragraphs, A–G. Choose the correct heading for paragraphs B, C, D, F and G from the list of headings below. Select the correct number, i–viii.',
              type: 'matching',
              sharedPrompt: 'Example: Paragraph E — viii',
              options: [
                'i Reaching for stronger winds',
                'ii A spinning solution that arrived too early',
                'iii The slow decline of sail as a trade',
                'iv Reasons for the slow take-up of wind power',
                'v An old idea reinvented with modern materials and controls',
                'vi The legal ban on fossil fuels in international waters',
                'vii Why sailors resisted new technology',
                'viii A design borrowed from aircraft wings',
              ],
              questions: [
                {
                  number: 14,
                  prompt: 'Paragraph B',
                  answerKey: 'iii',
                  explanation: 'Đoạn B: buồm thống trị rồi dần nhường chỗ cho hơi nước và dầu rẻ, trở thành thứ hiếm thấy.',
                },
                {
                  number: 15,
                  prompt: 'Paragraph C',
                  answerKey: 'ii',
                  explanation: 'Đoạn C: tàu Flettner hoạt động tốt nhưng không hiệu quả kinh tế, ý tưởng bị lãng quên.',
                },
                {
                  number: 16,
                  prompt: 'Paragraph D',
                  answerKey: 'v',
                  explanation: 'Đoạn D: nguyên lý cũ nhưng dùng vật liệu composite, motor điện, phần mềm điều khiển.',
                },
                {
                  number: 17,
                  prompt: 'Paragraph F',
                  answerKey: 'i',
                  explanation: 'Đoạn F: gió trên cao nhanh và ổn định hơn nên diều được thả cao.',
                },
                {
                  number: 18,
                  prompt: 'Paragraph G',
                  answerKey: 'iv',
                  explanation: 'Đoạn G: chi phí lắp đặt, không gian boong, vấn đề chủ tàu không trả tiền nhiên liệu, giới hạn chiều cao.',
                },
              ],
            },
            {
              id: 'nov18-p2-g2',
              title: 'Questions 19–22',
              instruction:
                'Look at the following statements (Questions 19–22) and the list of technologies below. Match each statement with the correct technology, A, B or C. You may use any letter more than once.',
              type: 'matching',
              options: [
                'A Rotor sail (a spinning cylinder)',
                'B Wing sail',
                'C Kite',
              ],
              questions: [
                {
                  number: 19,
                  prompt: 'It takes advantage of the faster winds found at greater heights.',
                  answerKey: 'C',
                  explanation: 'Đoạn F: diều khai thác gió mạnh hơn ở độ cao lớn.',
                },
                {
                  number: 20,
                  prompt: 'It was used on a transatlantic voyage in the 1920s.',
                  answerKey: 'A',
                  explanation: 'Đoạn C: tàu gắn trụ quay của Flettner vượt Đại Tây Dương năm 1926.',
                },
                {
                  number: 21,
                  prompt: 'Its design is based on that of an aircraft wing.',
                  answerKey: 'B',
                  explanation: 'Đoạn E: wing sail có hình dạng giống cánh máy bay.',
                },
                {
                  number: 22,
                  prompt: 'It needs a motor to make part of it turn.',
                  answerKey: 'A',
                  explanation: 'Đoạn C và D: trụ quay bằng động cơ (điện).',
                },
              ],
            },
            {
              id: 'nov18-p2-g3',
              title: 'Questions 23–26',
              instruction:
                'Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer.',
              type: 'fill-blank',
              questions: [
                {
                  number: 23,
                  prompt: 'Wind-assist devices work best on long ocean voyages where there are steady _________.',
                  answerKey: 'crosswinds',
                  explanation: 'Đoạn G: steady crosswinds.',
                },
                {
                  number: 24,
                  prompt: 'Some operators choose their route using _________ software to find helpful winds.',
                  answerKey: 'weather-routing',
                  explanation: 'Đoạn G: weather-routing software (từ ghép có gạch nối tính là một từ).',
                },
                {
                  number: 25,
                  prompt: 'Owners have little reason to pay for wind devices when the _________ bill is paid by the charterer.',
                  answerKey: 'fuel',
                  explanation: 'Đoạn G: tiền nhiên liệu thường do bên thuê tàu trả.',
                },
                {
                  number: 26,
                  prompt: 'Some ports and bridges set a limit on the _________ of ships.',
                  answerKey: 'height',
                  explanation: 'Đoạn G: limit the height of ships.',
                },
              ],
            },
          ],
        },
        {
          id: 'nov18-passage-3',
          title: 'The Paradox of the Helpful Machine',
          subtitle: 'You should spend about 20 minutes on Questions 27–40, which are based on Reading Passage 3 below.',
          content: `A In 1983, the psychologist Lisanne Bainbridge published a short paper with a title that has aged remarkably well: 'Ironies of Automation'. Her argument was simple but unsettling. When designers hand the routine parts of a job to a machine, she observed, they usually leave the human operator with whatever the machine cannot manage, and those leftovers tend to be the hardest parts: watching for failures that rarely occur and taking over when something goes badly wrong. Worse, the operator is expected to perform this demanding role without the daily practice that once built the necessary expertise. Four decades on, as software moves into medicine, finance, law and education, her warning has lost none of its relevance.

B The most visible symptom is skill fade. Skills are perishable: a pilot who spends most of a long flight monitoring an autopilot has few chances to practise hand-flying, and the ability to do it smoothly in a crisis can erode without anyone noticing. In 2013 the American aviation regulator urged airlines to encourage pilots to fly manually more often, a recognition that cockpits had become so automated that crews risked losing the basics. Similar worries have surfaced in other fields. Some researchers who study doctors performing colonoscopies, for example, have suggested that clinicians who grow accustomed to computer assistance may become less alert to abnormalities when the software is switched off. The evidence in such cases is still emerging, but the pattern is consistent with what psychologists would expect.

C Skill fade is only half the story. The second problem is a shift in attitude. In a widely read paper from 1997, Raja Parasuraman and Victor Riley distinguished between 'disuse', in which people ignore a tool that would help them, and 'misuse', in which they rely on it more than its performance justifies. Misuse tends to grow with success: the longer a system performs well, the less inclined people are to check it, and the more likely they are to accept an answer simply because it came from a machine. This is sometimes called automation bias. It is not a sign of laziness. It is a rational response to experience, which is precisely why it is so hard to dislodge.

D A common response is that the answer lies in better machines: once systems are reliable enough, the argument goes, human skill will hardly matter. This seems optimistic. No system is perfect, and the failures that remain are likely to be unusual ones, outside the situations its designers anticipated, which is exactly where a human is needed. Moreover, the moment of hand-over is itself hazardous. A machine typically gives control back when it is confused, so the person who takes over must grasp a complicated situation within seconds, having been a bystander until then.

E What, then, can be done? Nobody serious proposes switching the automation off; flying and diagnosing are, on average, safer with it. The aim is to keep people genuinely engaged rather than merely present. One approach is deliberate practice: some airlines now schedule sessions in which crews fly by hand, much as athletes train fundamentals however advanced their equipment becomes. Reminders and warnings, by contrast, have a poor record. Telling people to stay alert while a machine does the work is rather like asking someone to stay fit by watching others exercise; it is no substitute for doing the thing itself.

F A more ambitious idea is adaptive automation, in which the system itself returns tasks to the human at intervals, or when it detects that the person's attention is drifting. Early trials suggest that this can keep operators sharper, though critics point out that being handed a task at an arbitrary moment can be an irritation and, in a busy setting, a distraction. Equally important is transparency. A system that displays what it is doing and why gives its user something to evaluate, whereas one that simply delivers an answer invites blind acceptance. Designers who treat the interface as a window onto the machine's reasoning, rather than a screen that hides it, are likelier to produce users who notice when something is wrong.

G The lesson extends beyond cockpits and clinics. Students who use a calculator, a spell-checker or a text generator before they have mastered the underlying skill may never develop it, and the same logic applies to any tool that performs a task faster than a beginner can. That does not mean such tools should be banned; it means the scaffolding should come away at the right moment, so that the learner is left able to do what the tool does. Ultimately, the right question to ask of any automated system is not how much work it takes off our hands, but what it leaves us able to do.`,
          questionGroups: [
            {
              id: 'nov18-p3-g1',
              title: 'Questions 27–32',
              instruction:
                'Do the following statements agree with the claims of the writer in Reading Passage 3? Choose YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, or NOT GIVEN if it is impossible to say what the writer thinks about this.',
              type: 'yes-no-ng',
              options: ['YES', 'NO', 'NOT GIVEN'],
              questions: [
                {
                  number: 27,
                  prompt: 'According to Bainbridge, the tasks left to humans after automation tend to be the most difficult ones.',
                  answerKey: 'YES',
                  explanation: 'Đoạn A: phần việc còn lại cho con người thường là phần khó nhất.',
                },
                {
                  number: 28,
                  prompt: 'Over-trust in machines is more common among inexperienced workers than among experienced ones.',
                  answerKey: 'NOT GIVEN',
                  explanation: 'Đoạn C nói niềm tin tăng theo thành công của máy, không so sánh người mới với người có kinh nghiệm.',
                },
                {
                  number: 29,
                  prompt: 'It is unrealistic to expect machines to become so reliable that human skill is no longer needed.',
                  answerKey: 'YES',
                  explanation: 'Đoạn D: quan điểm "máy sẽ đủ tin cậy" bị cho là lạc quan, vì không hệ thống nào hoàn hảo.',
                },
                {
                  number: 30,
                  prompt: 'Pilots should be prevented from using the autopilot during routine flights.',
                  answerKey: 'NO',
                  explanation: 'Đoạn E: không ai nghiêm túc đề xuất tắt tự động hóa.',
                },
                {
                  number: 31,
                  prompt: 'Reminding workers to stay alert is enough to prevent skill fade.',
                  answerKey: 'NO',
                  explanation: 'Đoạn E: nhắc nhở và cảnh báo có hiệu quả kém, không thay được thực hành.',
                },
                {
                  number: 32,
                  prompt: 'The same pattern of skill loss will eventually appear in the teaching profession.',
                  answerKey: 'NOT GIVEN',
                  explanation: 'Đoạn G chỉ nói về người học, không nói gì về nghề giáo.',
                },
              ],
            },
            {
              id: 'nov18-p3-g2',
              title: 'Questions 33–36',
              instruction: 'Choose the correct letter, A, B, C or D.',
              type: 'multiple-choice',
              questions: [
                {
                  number: 33,
                  prompt: 'What does the writer suggest about the medical evidence mentioned in paragraph B?',
                  options: [
                    "A. It proves that computer assistance weakens doctors' skills.",
                    'B. It contradicts the findings from aviation.',
                    'C. It is still emerging but fits what theory would predict.',
                    'D. It shows that doctors lose skills more quickly than pilots.',
                  ],
                  answerKey: 'C',
                  explanation: 'Đoạn B: bằng chứng còn đang xuất hiện nhưng khớp với dự đoán của tâm lý học. A sai vì không nói là đã chứng minh.',
                },
                {
                  number: 34,
                  prompt: 'What does the writer say is the main danger when a machine hands control back to a person?',
                  options: [
                    'A. The person must make sense of a complex situation very quickly.',
                    'B. The machine may fail to give any warning.',
                    'C. The person may be unfamiliar with the controls.',
                    'D. The machine may refuse to release control.',
                  ],
                  answerKey: 'A',
                  explanation: 'Đoạn D: người tiếp quản phải hiểu tình huống phức tạp trong vài giây.',
                },
                {
                  number: 35,
                  prompt: "What is the writer's view of adaptive automation?",
                  options: [
                    'A. It has been shown to work better than manual practice.',
                    'B. It is too expensive for most industries to adopt.',
                    'C. It is suitable only for use in aviation.',
                    'D. It looks promising but may annoy or distract users.',
                  ],
                  answerKey: 'D',
                  explanation: 'Đoạn F: thử nghiệm sớm khả quan, nhưng có thể gây khó chịu hoặc phân tâm.',
                },
                {
                  number: 36,
                  prompt: "What is the writer's main purpose in paragraph G?",
                  options: [
                    'A. to warn teachers against allowing digital tools in classrooms',
                    'B. to apply the argument to learning and suggest a general test for automated systems',
                    'C. to argue that students are more at risk than professionals',
                    'D. to summarise research on the use of calculators',
                  ],
                  answerKey: 'B',
                  explanation: 'Đoạn G: mở rộng sang việc học và nêu câu hỏi đánh giá mọi hệ thống tự động.',
                },
              ],
            },
            {
              id: 'nov18-p3-g3',
              title: 'Questions 37–40',
              instruction:
                'Complete each sentence with the correct ending, A–F, below. Select the correct letter, A–F.',
              type: 'matching',
              options: [
                'A the system shows the reasoning behind its results.',
                'B tasks are given back to them from time to time.',
                'C the machine has made frequent errors.',
                'D people stop practising abilities they once used regularly.',
                'E users receive written warnings about the risks.',
                'F it has performed well for a long time.',
              ],
              questions: [
                {
                  number: 37,
                  prompt: 'Skill fade is most likely to occur when',
                  answerKey: 'D',
                  explanation: 'Đoạn B: ít cơ hội thực hành thì kỹ năng mai một.',
                },
                {
                  number: 38,
                  prompt: 'Over-reliance on a machine is most likely to grow when',
                  answerKey: 'F',
                  explanation: 'Đoạn C: hệ thống càng hoạt động tốt lâu, người dùng càng ít kiểm tra.',
                },
                {
                  number: 39,
                  prompt: 'Adaptive automation may keep operators sharper because',
                  answerKey: 'B',
                  explanation: 'Đoạn F: hệ thống trả lại nhiệm vụ cho người theo định kỳ.',
                },
                {
                  number: 40,
                  prompt: 'Users are more likely to notice that something is wrong if',
                  answerKey: 'A',
                  explanation: 'Đoạn F: hệ thống hiển thị lý do hoạt động thì người dùng dễ nhận ra lỗi.',
                },
              ],
            },
          ],
        },
      ],
    },
    writing: {
      durationSeconds: 3600, // 60 minutes
      tasks: [
        {
          id: 'nov18-writing-task-1',
          taskNumber: 1,
          title: 'Writing Task 1',
          suggestedMinutes: 20,
          minWords: 150,
          svgChartType: 'line-wfh-2016-2026',
          prompt:
            'You should spend about 20 minutes on this task.\n\nThe graph below shows the percentage of employees who worked from home at least three days a week in four countries between 2016 and 2026.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.',
        },
        {
          id: 'nov18-writing-task-2',
          taskNumber: 2,
          title: 'Writing Task 2',
          suggestedMinutes: 40,
          minWords: 250,
          prompt:
            'You should spend about 40 minutes on this task.\n\nWrite about the following topic:\n\nSome people believe that cities should limit the number of tourists visiting popular sites in order to protect local communities and the environment. Others think that tourism brings so many economic benefits that it should not be restricted.\n\nDiscuss both views and give your own opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.',
        },
      ],
    },
    listening: {
      durationSeconds: 1920,
      parts: [
        {
          id: 'listening-practice-part-1',
          title: 'Part 1',
          instruction: 'Listen and answer questions 1–10.',
          audioUrl: '/audio/listening-part-1.mp3',
          questionGroups: [
            {
              id: 'lp1-g1',
              title: 'Questions 1–6',
              instruction:
                'Complete the table below. Write ONE WORD AND/OR A NUMBER for each answer.',
              type: 'fill-blank',
              table: {
                headers: ['Name of course', 'What you learn', 'Cost', 'Other information'],
                rows: [
                  [
                    'Taster day',
                    'introduction to sailing',
                    '£120 if booking one place',
                    'small groups (max {{1}} people)',
                  ],
                  [
                    'Level 1',
                    'basic theory e.g. understanding the {{2}} and tides\nbasic sailing skills including {{3}} information',
                    '£200\n{{4}} available for club members\nall inclusive (plus a useful {{5}})',
                    'a {{6}} at the end of the course for all participants',
                  ],
                ],
              },
              questions: [
                {
                  number: 1,
                  prompt: 'Taster day — Other information: small groups (max _________ people)',
                  answerKey: '10|ten',
                  explanation: 'Part 1: "usually about eight people but no more than ten".',
                },
                {
                  number: 2,
                  prompt: 'Level 1 — What you learn: basic theory e.g. understanding the _________ and tides',
                  answerKey: 'weather',
                  explanation: 'Part 1: "learn about things like the weather ... and also the tides".',
                },
                {
                  number: 3,
                  prompt: 'Level 1 — What you learn: basic sailing skills including _________ information',
                  answerKey: 'safety',
                  explanation: 'Part 1: "make sure you understand everything you need to know about safety".',
                },
                {
                  number: 4,
                  prompt: 'Level 1 — Cost: _________ available for club members',
                  answerKey: 'discount|discounts',
                  explanation: 'Part 1: "There\'s a discount for members."',
                },
                {
                  number: 5,
                  prompt: 'Level 1 — Cost: all inclusive (plus a useful _________ )',
                  answerKey: 'dictionary',
                  explanation: 'Part 1: "you also get a really good dictionary explaining all the sailing terminology".',
                },
                {
                  number: 6,
                  prompt: 'Level 1 — Other information: a _________ at the end of the course for all participants',
                  answerKey: 'certificate',
                  explanation: 'Part 1: "on completion of the course you get a certificate".',
                },
              ],
            },
            {
              id: 'lp1-g2',
              title: 'Questions 7–10',
              instruction: 'Complete the notes below. Write ONE WORD ONLY for each answer.',
              type: 'fill-blank',
              sharedPrompt: 'General information\n• Participants must be able to swim.',
              questions: [
                {
                  number: 7,
                  prompt: 'Bring suitable clothing, a _________ and toiletries (e.g. shampoo).',
                  answerKey: 'towel',
                  explanation: 'Part 1: "MAN: And a towel? WOMAN: Yes definitely."',
                },
                {
                  number: 8,
                  prompt: 'There is a _________ at the club.',
                  answerKey: 'café|cafe',
                  explanation: 'Part 1: "MAN: ...is there a café at the club? WOMAN: Yes, you can get sandwiches, cakes and snacks there."',
                },
                {
                  number: 9,
                  prompt: 'Online training _________ are recommended.',
                  answerKey: 'videos',
                  explanation: 'Part 1: "I recommend you watch some videos we use for training. They\'re available online."',
                },
                {
                  number: 10,
                  prompt: '_________ are available for course participants.',
                  answerKey: 'lockers',
                  explanation: 'Part 1: "wondering if there are lockers for people to use? WOMAN: Yes, there are plenty in the changing rooms."',
                },
              ],
            },
          ],
        },
        {
          id: 'listening-practice-part-2',
          title: 'Part 2',
          instruction: 'Listen and answer questions 11–20.',
          audioUrl: '/audio/listening-part-2.mp3',
          questionGroups: [
            {
              id: 'lp2-g1',
              title: 'Questions 11–16',
              instruction: 'Choose the correct letter, A, B or C.',
              type: 'multiple-choice',
              questions: [
                {
                  number: 11,
                  prompt: 'What should trainees always expect to get when working on low budget short films?',
                  options: ['A. travel expenses', 'B. a minimum wage', 'C. meals'],
                  answerKey: 'A',
                  explanation: 'Part 2: "you\'ll be working for free... Make sure your transport costs are covered - and remember, there\'s very unlikely to be any catering provided".',
                },
                {
                  number: 12,
                  prompt: 'According to the speaker, on big budget films trainees may get experience of',
                  options: [
                    'A. makeup for special effects.',
                    'B. working with different ethnicities.',
                    'C. creating a variety of hair styles.',
                  ],
                  answerKey: 'B',
                  explanation: 'Part 2: "you\'re likely to get the opportunity to work with a range of age groups, as well as different ethnicities" (còn hair styling là bộ phận riêng và special effects không được thực hành).',
                },
                {
                  number: 13,
                  prompt: 'The speaker says a problem for makeup artists is',
                  options: [
                    'A. dealing with difficult directors.',
                    'B. being shouted at by their supervisor.',
                    'C. waiting around for hours doing nothing.',
                  ],
                  answerKey: 'A',
                  explanation: 'Part 2: "having to work with directors who are impatient, or unhappy with the makeup artist\'s work".',
                },
                {
                  number: 14,
                  prompt: 'How did the speaker feel when she met famous actors for the first time?',
                  options: ['A. very shy', 'B. very proud', 'C. very disappointed'],
                  answerKey: 'A',
                  explanation: 'Part 2: "At first, I found it overwhelming and could hardly speak. I was so in awe."',
                },
                {
                  number: 15,
                  prompt: 'What advice does the speaker give about makeup kits?',
                  options: [
                    'A. Always carry a basic kit with you.',
                    'B. Only buy the best products for a makeup kit.',
                    'C. Ask other makeup artists to check your kit.',
                  ],
                  answerKey: 'A',
                  explanation: 'Part 2: "expected to have with them at all times. Just the essentials will do...".',
                },
                {
                  number: 16,
                  prompt: 'What advice does the speaker give about creating a portfolio?',
                  options: [
                    'A. Keep print and digital photos.',
                    'B. Only include a small selection of photos.',
                    'C. Get permission to use photos.',
                  ],
                  answerKey: 'C',
                  explanation: 'Part 2: "you\'ll need to get approval from the makeup designer in charge of the department".',
                },
              ],
            },
            {
              id: 'lp2-g2',
              title: 'Questions 17–20',
              instruction:
                'What ability is required for each of the following duties? Write the correct letter, A, B or C.',
              type: 'matching',
              options: ['A. being well-organised', 'B. being flexible', 'C. working quickly'],
              questions: [
                {
                  number: 17,
                  prompt: 'Prepping an actor',
                  answerKey: 'C',
                  explanation: 'Part 2: "get this done without wasting any time, otherwise the makeup artist will get behind schedule".',
                },
                {
                  number: 18,
                  prompt: 'Continuity',
                  answerKey: 'A',
                  explanation: 'Part 2: "put in each actor\'s file. This information needs to be kept in good order".',
                },
                {
                  number: 19,
                  prompt: 'General',
                  answerKey: 'B',
                  explanation: 'Part 2: "being willing to do whatever is asked of you".',
                },
                {
                  number: 20,
                  prompt: 'Applying makeup',
                  answerKey: 'C',
                  explanation: 'Part 2: "need to keep up a swift pace and not spend too long on each person".',
                },
              ],
            },
          ],
        },
        {
          id: 'listening-practice-part-3',
          title: 'Part 3',
          instruction: 'Listen and answer questions 21–30.',
          audioUrl: '/audio/listening-part-3.mp3',
          questionGroups: [
            {
              id: 'lp3-g1',
              title: 'Questions 21–22',
              instruction: 'Choose TWO letters, A–E.',
              type: 'multiple-choice',
              maxSelect: 2,
              sharedPrompt:
                'Which TWO features of the lecture on ocean biodiversity had the greatest impact on the students?',
              options: [
                'A. the references to local problems',
                'B. the broad focus of the examples',
                'C. the practical suggestions for solutions',
                'D. the type of issues discussed',
                'E. the implications for government policy',
              ],
              questions: [
                {
                  number: 21,
                  prompt:
                    'Feature 1 — Which TWO features of the lecture on ocean biodiversity had the greatest impact on the students?',
                  answerKey: 'B',
                  explanation:
                    'Part 3: "The examples she gave were at a more global level, and they really made it clear to me just how wide-ranging the threats... are." -> B.',
                },
                {
                  number: 22,
                  prompt:
                    'Feature 2 — Which TWO features of the lecture on ocean biodiversity had the greatest impact on the students?',
                  answerKey: 'D',
                  explanation:
                    'Part 3: "her lecture focused on more long-term issues ... things that aren\'t currently receiving widespread attention" -> D.',
                },
              ],
            },
            {
              id: 'lp3-g2',
              title: 'Questions 23–24',
              instruction: 'Choose TWO letters, A–E.',
              type: 'multiple-choice',
              maxSelect: 2,
              sharedPrompt:
                'Which TWO details about the research project particularly impressed the students?',
              options: [
                "A. the team's previous successes",
                'B. its wide geographical scale',
                'C. the use of new technology',
                'D. the extensive statistical evidence',
                'E. the large range of specialists involved',
              ],
              questions: [
                {
                  number: 23,
                  prompt:
                    'Detail 1 — Which TWO details about the research project particularly impressed the students?',
                  answerKey: 'C',
                  explanation:
                    'Part 3: "improvements in systems used for tracking marine animals and things like robots were really interesting" -> C.',
                },
                {
                  number: 24,
                  prompt:
                    'Detail 2 — Which TWO details about the research project particularly impressed the students?',
                  answerKey: 'E',
                  explanation:
                    'Part 3: "unusual to have so many experts working together. LUCY: Yeah, and from such different backgrounds." -> E.',
                },
              ],
            },
            {
              id: 'lp3-g3',
              title: 'Questions 25–30',
              instruction:
                "What is the students' opinion of each of the following resources related to ocean biodiversity? Choose SIX answers from the box and write the correct letter, A–H.",
              type: 'matching',
              options: [
                'A. This is aimed at a very specialist audience.',
                'B. This is now rather outdated.',
                'C. This was an effective description of a new danger.',
                'D. This suggests possible ways to improve the situation.',
                'E. This does not give a balanced account.',
                'F. This is too predictable to be useful.',
                'G. This gives insufficient evidence for its claims.',
                'H. This gives a clear explanation of the problems.',
              ],
              questions: [
                {
                  number: 25,
                  prompt: 'Article on invasive lionfish',
                  answerKey: 'G',
                  explanation: 'Part 3: "he didn\'t really provide much information to explain why."',
                },
                {
                  number: 26,
                  prompt: 'Documentary on microplastics',
                  answerKey: 'B',
                  explanation: 'Part 3: "it was made ten years ago ... it was showing its age."',
                },
                {
                  number: 27,
                  prompt: 'Podcast on ocean pollution',
                  answerKey: 'F',
                  explanation: 'Part 3: "Most of it was stating the obvious ... everybody knows that anyway."',
                },
                {
                  number: 28,
                  prompt: 'Book on coastal ecosystems',
                  answerKey: 'H',
                  explanation: 'Part 3: "ended up with a much better understanding of the issues ... well-written summary ... diagrams helped a lot".',
                },
                {
                  number: 29,
                  prompt: 'Article on metal toxicity',
                  answerKey: 'A',
                  explanation: 'Part 3: "was way above my head ... I still don\'t understand it ... I just couldn\'t follow it."',
                },
                {
                  number: 30,
                  prompt: 'Podcast on floating marine cities',
                  answerKey: 'E',
                  explanation: 'Part 3: "presented a rather one-sided picture ... focused on how this would benefit people and ignored the effects on the environment."',
                },
              ],
            },
          ],
        },
        {
          id: 'listening-practice-part-4',
          title: 'Part 4',
          instruction: 'Listen and answer questions 31–40.',
          audioUrl: '/audio/listening-part-4.mp3',
          questionGroups: [
            {
              id: 'lp4-g1',
              title: 'Questions 31–40',
              instruction: 'Complete the notes below. Write ONE WORD ONLY for each answer.',
              type: 'fill-blank',
              sharedPrompt: 'Sources of rubber',
              questions: [
                {
                  number: 31,
                  prompt:
                    'Three resources which are essential for industrial civilisation: _________, fossil fuels, rubber',
                  answerKey: 'metal',
                  explanation: 'Part 4: "One of these is metal - without that we\'d have no machines and no transportation."',
                },
                {
                  number: 32,
                  prompt:
                    'Natural rubber (Pará rubber tree, South-East Asia) — supply is limited because the growth of the tree is _________.',
                  answerKey: 'slow',
                  explanation: 'Part 4: "take eight to ten years ... so cultivating them\'s a slow process."',
                },
                {
                  number: 33,
                  prompt:
                    'Production cannot easily be adjusted because of increasing or decreasing _________.',
                  answerKey: 'demand',
                  explanation: 'Part 4: "if they find the demand for that crop is rising or falling."',
                },
                {
                  number: 34,
                  prompt: 'The tree only grows near the _________.',
                  answerKey: 'equator',
                  explanation: 'Part 4: "it can\'t be grown in the northern or southern parts of the globe, only around the equator."',
                },
                {
                  number: 35,
                  prompt:
                    'Extracting latex is labour-intensive, and it is very difficult to _________ rubber after production.',
                  answerKey: 'recycle',
                  explanation: 'Part 4: "we can recycle them, but although this is also possible with rubber, it\'s very difficult".',
                },
                {
                  number: 36,
                  prompt:
                    'New threats include lack of genetic diversity, leading to danger of disease caused by a _________.',
                  answerKey: 'fungus',
                  explanation: 'Part 4: "The most dangerous threat is a fungus".',
                },
                {
                  number: 37,
                  prompt:
                    'A shift to the cultivation of palm oil, and extreme _________ events.',
                  answerKey: 'weather',
                  explanation: 'Part 4: "repeatedly hit by extreme types of weather".',
                },
                {
                  number: 38,
                  prompt:
                    'Synthetic rubber may be used for engine parts and cooking utensils, but is less _________ than natural rubber (unsuitable for aircraft tyres).',
                  answerKey: 'strong',
                  explanation: 'Part 4: "compared with natural rubber, it\'s not anything like as strong".',
                },
                {
                  number: 39,
                  prompt:
                    'An alternative source of natural rubber: a wild flower (a type of dandelion) has rubber in its _________.',
                  answerKey: 'roots',
                  explanation: 'Part 4: "when it\'s pulled up and its roots cut open, they\'re found to contain rubber."',
                },
                {
                  number: 40,
                  prompt:
                    'It can be grown in many locations and does not require good _________.',
                  answerKey: 'soil',
                  explanation: 'Part 4: "They\'ll grow in all sorts of places, and they don\'t need rich soil."',
                },
              ],
            },
          ],
        },
      ],
    },
  },
];
