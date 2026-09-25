#!/usr/bin/env python3
"""Builds the three extra TeleRehab condition pages from the knee-arthritis page (the template):
  python3 tools/make_condition_pages.py
Writes white-physio/programmes/{carpal-tunnel-de-quervain,erbs-palsy-injection-palsy,plantar-fasciitis}.html.
All wording here is PLACEHOLDER written for review: White's physiotherapists must check every health statement before launch.
To change a page, edit its block in PAGES below and run the script again (it overwrites the three files)."""
import re, os, json, html
ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'white-physio')
tpl = open(os.path.join(ROOT, 'programmes', 'knee-arthritis.html'), encoding='utf8').read()

def grab(cls):
    m = re.search(r'<span class="%s"[^>]*>(<svg.*?</svg>)</span>' % cls, tpl, re.S)
    return m.group(1)
SVG_X, SVG_ARROW, SVG_TICK = grab('pg-x-list__icon'), grab('pg-arrows__mark'), grab('pg-ticks__mark')

def x_list(items):
    return '<ul class="pg-x-list" data-placeholder>\n' + ''.join(
        f'          <li>\n            <span class="pg-x-list__icon" aria-hidden="true">{SVG_X}</span>\n            <p>{t}</p>\n          </li>\n' for t in items) + '        </ul>'
def arrows(items):
    return '<ul class="pg-arrows" data-placeholder>\n' + ''.join(
        f'            <li>\n              <span class="pg-arrows__mark" aria-hidden="true">{SVG_ARROW}</span>\n              <p>{t}</p>\n            </li>\n' for t in items) + '          </ul>'
def ticks(items, extra=''):
    return ''.join(f'              <li><span class="pg-ticks__mark" aria-hidden="true">{SVG_TICK}</span><span>{t}</span></li>\n' for t in items)
def quotes(items):
    return '<div class="pg-quotes" data-placeholder>\n' + ''.join(f'          <blockquote class="pg-quote"><p>&ldquo;{t}&rdquo;</p></blockquote>\n' for t in items) + '        </div>'
def phases(ph):
    out = '<ol class="pg-phases__list" data-placeholder>\n'
    for i, (days, title, goal, tk) in enumerate(ph, 1):
        cls = 'pg-phase pg-phase--blue' if i == 3 else 'pg-phase'
        out += f'''          <li class="{cls}">
            <span class="pg-phase__num" aria-hidden="true">{i}</span>
            <span class="pill pill--sm pg-phase__days">{days}</span>
            <h3 class="pg-phase__title">{title}</h3>
            <p class="pg-phase__goal"><strong>Goal:</strong> {goal}</p>
            <ul class="pg-ticks">
{ticks(tk)}            </ul>
          </li>
'''
    return out + '        </ol>'
def included(items):
    out = '<ul class="pg-included__list" data-placeholder>\n'
    for icon, title, text in items:
        out += f'''          <li class="pg-inc">
            <span class="pg-inc__icon" aria-hidden="true">{icon}</span>
            <div>
              <h3 class="pg-inc__title">{title}</h3>
              <p>{text}</p>
            </div>
          </li>
'''
    return out + '        </ul>'
def faq_html(items):
    out = '<div class="faq__list pg-faq" data-placeholder>\n'
    for q, a in items:
        out += f'''          <details class="faq__item">
            <summary><span>{q}</span><span class="faq__icon" aria-hidden="true"></span></summary>
            <div class="faq__answer"><p>{a}</p></div>
          </details>
'''
    return out + '        </div>'
def plain(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s))
def faq_ld(items):
    ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": plain(q), "acceptedAnswer": {"@type": "Answer", "text": plain(a)}} for q, a in items]}
    return '<script type="application/ld+json">\n' + json.dumps(ld, indent=2, ensure_ascii=False) + '\n  </script>'

COMMON_INC_LIVE = ('🎥', 'Live TeleRehab sessions with your physiotherapist', 'All 3 phases, shown step by step by a licensed physiotherapist. {x}')
COMMON_INC_WA = ('📱', 'Weekly WhatsApp follow-up and personal consultation', 'A personal check-in every week from our physiotherapy team. Your questions answered and your progress tracked. You are never left alone in your recovery for all 30 days.')
COMMON_INC_DAILY = ('🔔', 'Daily WhatsApp reminders and accountability support', 'Daily messages to keep you consistent with your exercises and daily habits, because consistency is what builds lasting recovery.')
TRY_SESSION = 'That is why you watch the free sample first.'
RED_FLAG_SURGERY = 'That is a decision to make with your doctor, and this programme does not replace medical advice.'
JOIN_Q = 'What do I need to join the live sessions?'
JOIN_A = 'A smartphone, tablet or computer and a steady internet connection. We send the session link on WhatsApp once your booking is confirmed. Sessions are usually 15 to 20 minutes, and we work with you to find times that fit your day.'
FIT_TAIL_YES = ['You want to fix the <strong>root cause</strong>, not just manage the symptoms', 'You can join a live video session on your phone or computer', 'You are ready to invest &#8358;15,000 in your recovery now']
FIT_TAIL_NO = ['You have not watched the free sample video yet', 'You do not have &#8358;15,000 available right now', 'You plan to pay later. This is not possible', 'You expect results without doing the exercises consistently']

PAGES = [
 dict(slug='carpal-tunnel-de-quervain', key='carpal', short='wrist and hand',
  name="Carpal Tunnel &amp; De Quervain's TeleRehab Programme",
  title="Carpal Tunnel &amp; De Quervain's TeleRehab | White Physiotherapy",
  desc="TeleRehab: live online physiotherapy sessions for carpal tunnel syndrome, De Quervain's tenosynovitis and wrist and hand pain, with a licensed physiotherapist and WhatsApp support.",
  ld_name="Carpal tunnel and De Quervain's syndrome TeleRehab programme",
  ld_desc="TeleRehab: live online physiotherapy sessions for carpal tunnel syndrome, De Quervain's tenosynovitis and wrist and hand pain, with a licensed physiotherapist and support on WhatsApp.",
  wa="Hello White Physiotherapy, I have a question about the Carpal Tunnel & De Quervain's TeleRehab programme.",
  hero=("That Tingling, Numb Hand at Night, the Wrist Pain When You Grip or Lift", "Here Is Why It Keeps Coming Back", "And How to Finally Get Relief"),
  hero_text="A licensed physiotherapist guides you <strong>live, in online sessions</strong>, through safe, gentle wrist and hand exercises that work on the cause of your pain, from your own home. <strong>No hospital queue.</strong> A few sessions a week, built around your schedule.",
  quotes=["My fingers go numb and tingle, mostly at night. <strong>I wake up shaking my hand</strong> just to get the feeling back.",
    "I keep dropping things: my cup, my phone, my keys. <strong>My grip feels weak</strong> and I no longer trust my hand.",
    "Every time I lift my baby, wring a cloth or open a bottle, a <strong>sharp pain shoots along the thumb side of my wrist</strong>.",
    "Typing, using my phone or writing for a short while makes my <strong>wrist ache and my fingers burn</strong>. My work is suffering.",
    "My thumb hurts so much when I grip that I use my other hand for everything, and <strong>that hand is starting to hurt too</strong>.",
    "I have been using a wrist support and taking pain drugs. It helps a little, <strong>then the pain and numbness come back</strong>."],
  real="They are the kind of things people with wrist and hand problems often tell us after months of putting up with it.",
  truth_h2="Why drugs, supports and quick fixes have not given you lasting relief",
  tried=["<strong>Pain relief drugs.</strong> They ease the pain for a few hours. When they wear off, <strong>the pain and tingling are back</strong>, because the pressure on your nerve or tendons is still there.",
    "<strong>Rest and wrist supports.</strong> Rest and a support can calm things down for a while. But if you go back to the same gripping, typing and lifting habits, and the muscles stay stiff and weak, <strong>the problem returns</strong>.",
    "<strong>Steroid injections.</strong> They can ease the pain for a time, but they do not change how you use your hand every day or make your wrist and forearm stronger, so the pain may come back.",
    "<strong>Massage or pulling the wrist.</strong> It may feel good for a moment, but it does not deal with why the nerve or tendons are irritated. Rough handling can sometimes make an inflamed tendon or nerve worse.",
    "<strong>Surgery advice.</strong> Some people do need surgery, and your doctor will tell you if you do. Even then, good rehabilitation matters, and many people want to try physiotherapy first.",
    "<strong>Random exercises from the internet.</strong> The wrong stretch can pull hard on an irritated nerve or tendon and <strong>make the symptoms worse</strong>."],
  causes_title="The real causes of your wrist and hand pain",
  causes_intro="Wrist and hand pain does not go away with drugs alone, because the <strong>real causes</strong> are in how your nerve and tendons are being squeezed and overworked:",
  causes=["<strong>A crowded wrist tunnel.</strong> In carpal tunnel syndrome, swelling or tight tissue in the narrow space at the wrist squeezes the median nerve. That causes numbness, tingling and burning in the thumb, index and middle fingers.",
    "<strong>Irritated thumb tendons.</strong> In De Quervain's syndrome, the two tendons on the thumb side of your wrist become swollen and rub in their sheath. That is why gripping, twisting and lifting hurt.",
    "<strong>Repeated strain.</strong> Long hours of typing, phone use, sewing, cooking, farming or carrying a baby can overload the wrist and thumb without enough rest or variety.",
    "<strong>Tight, weak forearm and hand muscles.</strong> Stiff forearm muscles and weak grip muscles make the wrist take more strain than it should.",
    "<strong>Poor wrist and neck posture.</strong> A bent wrist while sleeping or working, or a stiff neck and shoulder, can add pressure on the nerve along its path."],
  only="<strong>The only way to lasting relief</strong> is to deal with these causes: calm the irritated nerve and tendons, restore gentle movement, build strength and change the habits that overload your wrist. That is what this programme is built to do.",
  sample_text="Our licensed physiotherapist guides you through, live, the kind of <strong>gentle, safe wrist, hand and nerve-gliding exercises</strong> you'll do in your TeleRehab sessions, starting with Days 1 to 10. See for yourself how simple and doable they are, <strong>even if your hand is sore or tingling right now</strong>.",
  video_label="Carpal Tunnel &amp; De Quervain's TeleRehab session sample", testi_who='Participant, wrist and hand pain',
  phases=[("Days 1 to 10", "Phase 1: Calm the pain, tingling and swelling", "Settle the irritated nerve and tendons and ease the pain and tingling.",
     ["Gentle nerve-gliding movements, <strong>safe even when your hand is sore or tingling</strong>", "Simple tendon-gliding exercises to keep the fingers and thumb moving", "Cold and warm therapy guidance to ease pain and swelling at home", "Resting positions for the wrist, including how to rest your hand at night", "The right way to type, grip, lift and carry, from Day 1"]),
    ("Days 11 to 20", "Phase 2: Loosen, stretch and start strengthening", "Free up the tight forearm and wrist tissues and start rebuilding strength.",
     ["Forearm and wrist stretches to release tight muscles", "Thumb and finger mobility exercises for smoother movement", "Gentle grip and pinch strengthening, built up step by step", "Neck and shoulder movements, because they affect the nerve along its path", "A smarter set-up for your phone, keyboard, kitchen and childcare tasks"]),
    ("Days 21 to 30", "Phase 3: Return to work, home and daily life", "Use your hand with confidence again, without the pain or tingling coming back.",
     ["Functional strengthening for lifting, carrying, opening jars and writing", "Practise the tasks that bother you most, in a pain-controlled way", "Pacing and short-break routines for typing, phone use and repeated tasks", "Maintenance exercises to help keep the pain from returning", "The warning signs that mean you should see a doctor"])],
  inc=[('🎥', COMMON_INC_LIVE[1], COMMON_INC_LIVE[2].format(x='Every exercise is chosen to be gentle on a painful wrist and hand.')), COMMON_INC_WA,
    ('🖐️', 'Home wrist and hand routine guide', 'A simple routine you can repeat between sessions: nerve gliding, tendon gliding, stretches and grip work.'),
    ('💻', 'Ergonomics and daily-habit training', 'How to set up your phone, keyboard, desk and kitchen tasks, and how to lift and carry, so you stop overloading your wrist.'),
    ('🌙', 'Night-time and rest-position guidance', 'How to position your hand and wrist for sleep, and when a support may help, so you wake up with less numbness.'), COMMON_INC_DAILY],
  fit_yes=["You have tingling, numbness or burning in your thumb, index or middle finger", "You have pain on the thumb side of your wrist when you grip, twist or lift", "Your symptoms are worse at night or after typing, phone use or lifting", "Your grip feels weak or you drop things", "Rest, drugs or a wrist support only help for a short time"] + FIT_TAIL_YES,
  fit_no=["You have a wrist or hand fracture or injury less than 4 weeks old", "You have had wrist or hand surgery within the last 6 weeks", "Your hand or arm suddenly became weak or numb, or your face or speech is affected. Get medical help right away"] + FIT_TAIL_NO,
  price_ticks=["Live TeleRehab sessions", "Weekly WhatsApp follow-up and personal support", "Home wrist and hand routine guide", "Ergonomics and daily-habit training", "Night-time and rest-position guidance", "Daily WhatsApp reminders and accountability"],
  faq=[("Will these exercises really help my carpal tunnel or De Quervain's?", "Many people with mild to moderate nerve or tendon problems at the wrist feel better when the nerve and tendons are moved gently, the forearm is stretched and strengthened, and daily habits are corrected. That is what the programme guides you through. Severe or long-standing nerve squeezing may need a doctor's review, and results differ from person to person, so we cannot promise the same result for everyone. " + TRY_SESSION),
    ("I am afraid the exercises will make my pain or tingling worse.", "That is a common worry. Phase 1 (Days 1 to 10) uses very gentle movements. Go slowly and stay within what feels bearable. If an exercise sharply increases the pain or tingling, stop and message us on WhatsApp. If your hand becomes suddenly weak, very swollen, hot and red, or you have a fever, see a doctor urgently."),
    ("My doctor mentioned carpal tunnel surgery. Should I try this first?", RED_FLAG_SURGERY + " Some people improve with the right exercises and habit changes, while others still need surgery, especially if the nerve is badly squeezed or the muscle at the base of the thumb is wasting. Ask your doctor whether it is safe to try guided exercises first, and for how long. If you have had wrist or hand surgery in the last 6 weeks, please do not book yet."),
    ("I have used a wrist support and drugs before and they did not last. Why will this be different?", "Supports and drugs can calm symptoms, but they do not change how you use your hand every day or make your forearm and hand stronger. This programme gives you guided exercises, advice on your work and home habits, and weekly check-ins on WhatsApp. It may still not suit everyone, which is why the sample video comes first."),
    ("I use my hands all day for work, like typing, sewing, cooking or farming. Can I still do this?", "Yes. Sessions are usually 15 to 20 minutes and held live online. You do not have to stop working: we show you how to adjust the way you use your hands and when to take short breaks, so your wrist gets a rest while you keep going."),
    (JOIN_Q, JOIN_A)],
  decision="You can close this page and carry on with drugs and wrist supports, and hope the pain and numbness eventually go away. You may already know how that goes."),

 dict(slug='erbs-palsy-injection-palsy', key='erbs', short='nerve injury',
  name="Erb's Palsy &amp; Injection Palsy TeleRehab Programme",
  title="Erb's Palsy &amp; Injection Palsy TeleRehab | White Physiotherapy",
  desc="TeleRehab: live online physiotherapy sessions for Erb's palsy and injection palsy (nerve injury with arm, shoulder, leg or foot weakness), with a licensed physiotherapist, caregiver guidance and WhatsApp support.",
  ld_name="Erb's palsy and injection palsy TeleRehab programme",
  ld_desc="TeleRehab: live online physiotherapy sessions for Erb's palsy and injection palsy, with a licensed physiotherapist, caregiver guidance and support on WhatsApp.",
  wa="Hello White Physiotherapy, I have a question about the Erb's Palsy & Injection Palsy TeleRehab programme.",
  hero=("That Weak Arm That Hangs at Your Side, or the Foot That Drags After a Nerve Injury", "Here Is Why Movement Does Not Just Come Back on Its Own", "And How Guided Rehabilitation Can Help"),
  hero_text="A licensed physiotherapist guides you, and your caregiver if needed, <strong>live, in online sessions</strong>, through safe exercises that keep joints moving, wake up weak muscles and retrain movement, from your own home. How much movement returns depends on the nerve injury, and we will be honest with you about what is realistic.",
  quotes=["My arm hangs by my side. <strong>I cannot lift it</strong> to comb my hair, reach a shelf or carry my child.",
    "Ever since the injection, <strong>my foot drags when I walk</strong> and I trip on small things.",
    "My baby does not move one arm like the other. <strong>I do not know which exercises are safe</strong> and I am afraid of doing them wrongly.",
    "The muscles in my shoulder and arm are getting thinner, and <strong>my joints are getting stiff</strong>.",
    "Parts of my arm or leg feel numb or strange. <strong>I cannot tell how hot or cold something is</strong> and I keep hurting myself.",
    "The doctor said the nerve needs time, but <strong>nobody told me what to do while I wait</strong>."],
  real="They are the kind of things people with nerve injuries, and the family members who care for them, often tell us.",
  truth_h2="Why waiting, drugs and massage have not given you real progress",
  tried=["<strong>Just wait and see.</strong> Some nerves do need time. But waiting with no exercise can leave joints <strong>stiff and muscles weak</strong>. Guided movement while the nerve recovers makes a real difference.",
    "<strong>Massage and traditional treatment.</strong> Rubbing a weak limb may feel comforting, but it does not retrain the muscles. Pulling on a limb with a nerve injury can <strong>damage the shoulder or other joints</strong>.",
    "<strong>Drugs and vitamins.</strong> They may help with pain, but they do not move your joints or retrain your muscles.",
    "<strong>Waiting for surgery or a specialist.</strong> Some serious nerve injuries need a specialist or surgery, and your doctor will guide you. Even then, rehabilitation before and after matters.",
    "<strong>Not using the weak limb.</strong> Leaving an arm or foot unused can lead to stiffness, thinning of the muscles and even weaker movement.",
    "<strong>Random exercises from YouTube.</strong> These can strain a weak, unprotected shoulder or foot. Nerve injuries need <strong>carefully chosen, gentle exercises</strong>."],
  causes_title="What is really happening",
  causes_intro="Nerve injuries do not get better with drugs or massage alone, because the <strong>real problems</strong> are in the nerve, the muscles it controls and the joints around them:",
  causes=["<strong>An injured nerve.</strong> In Erb's palsy, the nerves running from the neck to the shoulder and arm were stretched or damaged, often at birth but sometimes after an accident. In injection palsy, a nerve was injured near an injection site, which can weaken the arm, shoulder, leg or foot.",
    "<strong>Weak, switched-off muscles.</strong> When a nerve is not sending strong signals, the muscles it supplies become weak and can shrink if they are not gently worked.",
    "<strong>Stiff joints and tight tissue.</strong> When a limb does not move normally, the shoulder, elbow, wrist, ankle and foot can become stiff and painful, making recovery harder.",
    "<strong>Compensating movements.</strong> The body finds other ways to move, such as shrugging the shoulder or dragging the foot. This can become a habit that limits recovery.",
    "<strong>Reduced feeling and low use.</strong> When feeling is reduced, the limb is used less and can be injured without you noticing, so it gets weaker still."],
  only="<strong>The way forward</strong> is guided, gentle rehabilitation: keep the joints moving, wake up weak muscles step by step, retrain movement and protect the limb while the nerve recovers. Recovery depends on how severe the nerve injury is, and this programme is built to give you the best support from home.",
  sample_text="Our licensed physiotherapist guides you through, live, the kind of <strong>gentle, safe movements, positioning and muscle-activation exercises</strong> you'll do in your TeleRehab sessions, starting with Days 1 to 10. See for yourself how simple and doable they are, <strong>even if the arm or foot is very weak right now</strong>.",
  video_label="Erb's &amp; Injection Palsy TeleRehab session sample", testi_who='Participant or caregiver',
  phases=[("Days 1 to 10", "Phase 1: Protect the limb, keep joints moving and wake up the muscles", "Keep the joints supple, protect the weak limb and start gentle muscle activation.",
     ["Safe positioning and handling of the weak arm or leg", "Gentle assisted movements to keep joints supple, done by you or your caregiver with the physiotherapist guiding", "Gentle muscle activation exercises, as far as the nerve allows", "Skin care and safety for parts with reduced feeling", "Caregiver training: how to help safely, <strong>without pulling on the limb</strong>"]),
    ("Days 11 to 20", "Phase 2: Strengthen and retrain movement", "Build strength in the muscles that are responding and retrain proper movement.",
     ["Step-by-step strengthening of the shoulder, elbow, hand, ankle or foot muscles that are responding", "Movement retraining, so you use the right muscles instead of compensating", "Sensory re-education exercises to help with reduced feeling", "Balance and walking practice for a dragging foot", "Simple activities that encourage use of the affected arm or leg"]),
    ("Days 21 to 30", "Phase 3: Build function and independence", "Use the arm or leg for daily tasks more confidently and independently.",
     ["Practise everyday tasks: dressing, reaching, carrying, walking and stairs", "Task-based training with repeated practice, adapted to your ability", "A long-term home routine you or your caregiver can keep up", "Advice on when to go back to your doctor or specialist", "Maintenance exercises to help keep joints supple and muscles working"])],
  inc=[('🎥', COMMON_INC_LIVE[1], COMMON_INC_LIVE[2].format(x='Every exercise is chosen to be safe for a weak or injured limb.')), COMMON_INC_WA,
    ('👨‍👩‍👧', 'Caregiver training and support', 'Family members learn how to position, help and encourage safely, so exercises can continue between sessions.'),
    ('📋', 'Home exercise and positioning guide', 'A simple, safe routine for you or your caregiver to repeat at home between sessions.'),
    ('🛡️', 'Limb protection and daily-living advice', 'How to protect a limb with reduced feeling, avoid injury and make everyday tasks easier while you recover.'), COMMON_INC_DAILY],
  fit_yes=["You or your child has weakness in an arm, shoulder, leg or foot after a nerve injury (Erb's palsy or injection palsy)", "A doctor has already checked the injury", "Your joints are getting stiff or your muscles are getting weaker", "You want to keep the limb supple and stronger while the nerve recovers", "You or a family member can join live sessions and help with the exercises"] + FIT_TAIL_YES[:1] + FIT_TAIL_YES[2:],
  fit_no=["The weakness is new and has not been checked by a doctor", "The weakness came on suddenly, or with a drooping face, confusion or trouble speaking. This is an emergency: get medical help now", "The limb has a fresh fracture, dislocation or open wound", "You have had nerve or shoulder surgery within the last 6 weeks"] + FIT_TAIL_NO,
  price_ticks=["Live TeleRehab sessions", "Weekly WhatsApp follow-up and personal support", "Caregiver training and support", "Home exercise and positioning guide", "Limb protection and daily-living advice", "Daily WhatsApp reminders and accountability"],
  faq=[("Can exercises really help Erb's palsy or injection palsy?", "How much recovery is possible depends on how badly the nerve was injured, and nobody can promise a particular result. What guided physiotherapy can do is keep joints supple, wake up and strengthen the muscles that are responding, retrain movement and prevent stiffness and other problems while the nerve recovers. " + TRY_SESSION),
    ("My child has Erb's palsy. Can this programme help?", "Yes, with a parent or caregiver taking part. You join the live session, and the physiotherapist shows you safe positioning and handling and simple exercises to do with your child. Please have your child checked by a doctor first, and never pull on your child's arm."),
    ("The nerve injury happened a long time ago. Is it too late?", "It is not too late to work on stiffness, the strength that is present, movement habits and daily function, although how much changes depends on the injury and how long ago it happened. Our physiotherapist will be honest with you about what is realistic."),
    ("I am afraid of doing the wrong exercise and making things worse.", "That is a fair worry, and it is why the sessions are live. Phase 1 uses gentle, safe movements that we guide step by step. If an exercise causes sharp pain, or you notice new or sudden weakness, numbness or swelling, stop and message us on WhatsApp, and see a doctor if it does not settle."),
    ("Does this replace seeing a doctor or specialist?", "No. Some nerve injuries need a specialist review or surgery, and only your doctor can advise on that. This programme works alongside your medical care and does not replace a diagnosis or treatment."),
    (JOIN_Q, JOIN_A + ' For a child or someone who needs help, a family member should be there to join in.')],
  decision="You can close this page and simply wait, hoping the arm or foot will start moving again on its own. Some nerves do need time, but waiting without guided movement can leave joints stiff and muscles weaker."),

 dict(slug='plantar-fasciitis', key='plantar', short='heel and foot',
  name="Plantar Fasciitis TeleRehab Programme (Heel &amp; Foot Pain)",
  title="Plantar Fasciitis TeleRehab | White Physiotherapy",
  desc="TeleRehab: live online physiotherapy sessions for plantar fasciitis, heel pain and foot pain, with a licensed physiotherapist and WhatsApp support.",
  ld_name="Plantar fasciitis and heel pain TeleRehab programme",
  ld_desc="TeleRehab: live online physiotherapy sessions for plantar fasciitis, heel pain and foot pain, with a licensed physiotherapist and support on WhatsApp.",
  wa="Hello White Physiotherapy, I have a question about the Plantar Fasciitis TeleRehab programme.",
  hero=("That Stabbing Heel Pain With Your First Steps Every Morning", "Here Is Why It Keeps Coming Back", "And How to Finally Get Relief"),
  hero_text="A licensed physiotherapist guides you <strong>live, in online sessions</strong>, through safe, gentle foot, calf and hip exercises that work on the cause of your heel pain, from your own home. <strong>No hospital queue.</strong> A few sessions a week, built around your schedule.",
  quotes=["The first steps out of bed feel like <strong>a nail going into my heel</strong>. It eases after a few minutes, then comes back.",
    "After sitting for a while, in the car, at church or at my desk, <strong>my heel hurts again</strong> when I stand up.",
    "By the end of the day, <strong>my heel and the sole of my foot are burning and aching</strong>. I cannot stand for long at work.",
    "I have started walking on the side of my foot or on my toes to avoid the pain, and now <strong>my hip and back hurt too</strong>.",
    "I have stopped walking to the market and standing to cook because <strong>every step reminds me of the pain</strong>.",
    "I have tried different shoes, pain drugs and massage. <strong>It gets better, then it comes right back.</strong>"],
  real="They are the kind of things people with heel and foot pain often tell us after months of putting up with it.",
  truth_h2="Why drugs, massage and new shoes have not given you lasting relief",
  tried=["<strong>Pain relief drugs.</strong> They reduce the pain for a few hours, but the strained tissue under your foot is still overloaded, so <strong>the pain comes back</strong>.",
    "<strong>Massage and rolling only.</strong> It may feel good for a while. But if your calf and foot muscles stay tight and weak and you keep the same habits, <strong>the pain returns</strong>.",
    "<strong>Steroid injections.</strong> They can ease the pain for a time, but they do not fix a tight calf, weak foot muscles or the way you load your foot, so the pain can come back.",
    "<strong>New shoes or insoles alone.</strong> Good footwear helps, but shoes cannot stretch a tight calf or strengthen your foot for you.",
    "<strong>Just resting it.</strong> Rest can settle a flare-up, but when you go back to standing and walking, an unconditioned foot takes the load again and <strong>the pain returns</strong>.",
    "<strong>Random stretches from the internet.</strong> Stretching too hard, or the wrong way, can <strong>irritate the heel further</strong>."],
  causes_title="The real causes of your heel pain",
  causes_intro="Heel pain does not go away with drugs or massage alone, because the <strong>real causes</strong> are in how your foot is being loaded:",
  causes=["<strong>An overloaded plantar fascia.</strong> This thick band under your foot supports the arch. Too much standing, walking or running, or a sudden increase, strains it where it attaches to the heel. That is the sharp pain you feel.",
    "<strong>Tight calf muscles and Achilles tendon.</strong> Tight calves pull on the heel and add strain to the band under your foot, especially with your first steps in the morning.",
    "<strong>Weak foot and hip muscles.</strong> When the small muscles of the foot and the muscles of the calf and hip are weak, the plantar fascia takes more of the load.",
    "<strong>Footwear and hard surfaces.</strong> Thin, flat or worn-out shoes and slippers, or long hours standing on hard floors, add strain every day.",
    "<strong>Extra body weight and sudden changes.</strong> Extra weight adds load with every step, and a sudden jump in standing, walking or exercise can trigger the pain."],
  only="<strong>The only way to lasting relief</strong> is to deal with these causes: stretch the tight tissues, strengthen the foot, calf and hip, manage how much load your heel takes and choose better footwear. That is what this programme is built to do.",
  sample_text="Our licensed physiotherapist guides you through, live, the kind of <strong>gentle, safe foot and calf exercises</strong> you'll do in your TeleRehab sessions, starting with Days 1 to 10. See for yourself how simple and doable they are, <strong>even if your heel is very sore right now</strong>.",
  video_label="Plantar Fasciitis TeleRehab session sample", testi_who='Participant, heel pain',
  phases=[("Days 1 to 10", "Phase 1: Relieve the pain and settle the heel", "Calm the irritated tissue under your heel and ease those painful first steps.",
     ["Gentle plantar fascia and calf stretches, <strong>safe even when your heel is very sore</strong>", "A simple routine to do <strong>before your first steps in the morning</strong> and after sitting", "Ice and rolling techniques to ease the pain at home", "Load management: how much to stand and walk, and how to pace your day", "Footwear guidance, including what to wear at home"]),
    ("Days 11 to 20", "Phase 2: Strengthen the foot, calf and hip", "Build the strength that takes the load off your heel.",
     ["Foot-strengthening exercises, such as towel scrunches and toe work, built up step by step", "Calf strengthening for a steadier heel and ankle", "Hip and thigh strengthening, because weak hips change how your foot lands", "Balance exercises for better foot control", "Simple weight management guidance, to reduce the load on your feet"]),
    ("Days 21 to 30", "Phase 3: Return to walking, work and life", "Stand, walk and move for longer without the heel pain returning.",
     ["Build up, little by little, how long you can stand and walk", "Practise walking, stairs and standing tasks with better foot movement", "A return-to-activity plan for exercise or sport, if you want it", "Maintenance exercises to help keep the pain from returning", "The warning signs that mean you should see a doctor"])],
  inc=[('🎥', COMMON_INC_LIVE[1], COMMON_INC_LIVE[2].format(x='Every exercise is chosen to be gentle on a painful heel and foot.')), COMMON_INC_WA,
    ('🦶', 'Home foot and calf routine guide', 'A simple routine you can repeat between sessions: plantar fascia and calf stretches, foot strengthening and balance work.'),
    ('🌅', 'Morning heel-pain routine', 'A short routine to do before your first steps out of bed, so the mornings hurt less.'),
    ('👟', 'Footwear and load-management guidance', 'What to look for in shoes and slippers, and how to pace standing and walking so you stop overloading your heel.'), COMMON_INC_DAILY],
  fit_yes=["You have pain in your heel or under your foot", "Your first steps in the morning, or after sitting, are the most painful", "Standing or walking for long makes the pain worse", "Drugs, massage or new shoes only help for a short time"] + FIT_TAIL_YES,
  fit_no=["You have a foot or heel fracture or injury less than 4 weeks old", "You have had foot or ankle surgery within the last 6 weeks", "You have an open wound or ulcer on your foot, or your foot is swollen, hot and red. See a doctor urgently"] + FIT_TAIL_NO,
  price_ticks=["Live TeleRehab sessions", "Weekly WhatsApp follow-up and personal support", "Home foot and calf routine guide", "Morning heel-pain routine", "Footwear and load-management guidance", "Daily WhatsApp reminders and accountability"],
  faq=[("Will these exercises really help my plantar fasciitis?", "Many people with heel pain feel better when the calf and plantar fascia are stretched, the foot and hip muscles are strengthened, and the load on the heel is managed. That is what the programme guides you through. It can take weeks to months, and results differ from person to person, so we cannot promise the same result for everyone. " + TRY_SESSION),
    ("I am afraid the exercises will make my heel pain worse.", "That is a common worry. Phase 1 (Days 1 to 10) uses very gentle stretches and movements. Go slowly and stay within what feels bearable. If an exercise sharply increases the pain, stop and message us on WhatsApp. If your foot becomes suddenly swollen, hot and red, or you have a fever, or you cannot put any weight on it, see a doctor urgently."),
    ("My doctor mentioned an injection or surgery. Should I try this first?", RED_FLAG_SURGERY + " Many people improve with exercises, load changes and better footwear, but it depends on the person. Ask your doctor whether it is safe to try guided exercises first, and for how long. If you have had foot or ankle surgery in the last 6 weeks, please do not book yet."),
    ("My X-ray shows a heel spur. Can I still do this?", "Many people have a heel spur without any pain, and heel pain often comes from the irritated tissue around the heel rather than the spur itself. Many people with a heel spur still improve with exercises and load management. Your physiotherapist will guide you, and your doctor should decide if anything else is needed."),
    ("I have diabetes or numb feet. Is this safe?", "Please check with your doctor before you start. If you have an open wound or ulcer, or you cannot feel your feet properly, do not book until your doctor says it is safe."),
    ("I stand all day for work. Can I still do this?", "Yes. Sessions are usually 15 to 20 minutes and held live online. We show you how to pace your day, take short breaks when you can and choose better footwear, so your heel gets relief while you keep working. " + JOIN_A)],
  decision="You can close this page and carry on with drugs and new shoes, and hope the heel pain eventually goes away. You may already know how that goes."),
]

def between(s, start_pat, end_pat, repl, flags=re.S):
    """Replace text from start_pat through the first end_pat after it."""
    m = re.search(start_pat, s, flags)
    assert m, start_pat
    e = re.compile(end_pat, flags).search(s, m.end())
    assert e, end_pat
    return s[:m.start()] + repl + s[e.end():]

def build(p):
    s = tpl
    k = 'knee'
    # ---- head
    s = s.replace('Knee Arthritis TeleRehab | White Physiotherapy', p['title'])
    s = s.replace('TeleRehab: live online physiotherapy sessions for knee arthritis and joint pain, with a licensed physiotherapist and WhatsApp support.', p['desc'])
    s = s.replace('Knee arthritis and joint recovery TeleRehab programme', p['ld_name'])
    s = s.replace('TeleRehab: live online physiotherapy sessions for knee arthritis and joint pain, with a licensed physiotherapist and support on WhatsApp.', p['ld_desc'])
    s = re.sub(r'<script type="application/ld\+json">\s*\{\s*"@context": "https://schema.org",\s*"@type": "FAQPage".*?</script>', lambda m: faq_ld(p['faq']), s, flags=re.S)
    s = s.replace('Hello White Physiotherapy, I have a question about the Knee Arthritis TeleRehab programme.', p['wa'])
    from urllib.parse import quote
    s = s.replace('Hello%20White%20Physiotherapy%2C%20I%20have%20a%20question%20about%20the%2030-day%20knee%20arthritis%20programme.', quote(p['wa'], safe=''))
    s = re.sub(r'KNEE ARTHRITIS &amp; JOINT RECOVERY programme page\. Made from piriformis-syndrome\.html.*?========================================================================== -->',
      lambda m: f'{plain(p["name"]).upper()} page. Generated by tools/make_condition_pages.py from the knee-arthritis page (same sections, same order, same components).\n         ALL wording is PLACEHOLDER written for review: White\'s physiotherapists must check every health statement, the red-flag wording and the "do not book if" rules before launch.\n         No price claims beyond the TeleRehab price shared with the other programme pages, no guarantee, no fake urgency.\n         ========================================================================== -->', s, flags=re.S)
    # ---- hero
    s = s.replace('Knee Arthritis &amp; Joint TeleRehab Programme', p['name'])
    s = between(s, r'<h1 id="pg-hero-title" class="pg-hero__title" data-placeholder>', r'</h1>',
      f'<h1 id="pg-hero-title" class="pg-hero__title" data-placeholder>\n          <span>{p["hero"][0]}</span>\n          <span class="accent-italic">{p["hero"][1]}</span>\n          <span>{p["hero"][2]}</span>\n        </h1>')
    s = between(s, r'<p class="pg-hero__text" data-placeholder>', r'</p>', f'<p class="pg-hero__text" data-placeholder>{p["hero_text"]}</p>')
    # ---- sound like your life
    s = between(s, r'<div class="pg-quotes" data-placeholder>', r'\n        </div>', quotes(p['quotes']))
    s = between(s, r'<p class="pg-sound__real" data-placeholder>', r'</p>', f'<p class="pg-sound__real" data-placeholder><strong>These are not just descriptions of pain.</strong> {p["real"]}</p>')
    # ---- honest truth
    s = s.replace('Why drugs, massage and quick fixes have not given you lasting relief', p['truth_h2'])
    s = between(s, r'<ul class="pg-x-list" data-placeholder>', r'</ul>', x_list(p['tried']))
    s = s.replace('The real causes of your knee pain', p['causes_title'])
    s = between(s, r'<p class="pg-causes__intro" data-placeholder>', r'</p>', f'<p class="pg-causes__intro" data-placeholder>{p["causes_intro"]}</p>')
    s = between(s, r'<ul class="pg-arrows" data-placeholder>', r'</ul>', arrows(p['causes']))
    s = between(s, r'<p class="pg-truth__only" data-placeholder>', r'</p>', f'<p class="pg-truth__only" data-placeholder>{p["only"]}</p>')
    # ---- sample video
    s = between(s, r'<p class="pg-sample__text" data-placeholder>', r'</p>', f'<p class="pg-sample__text" data-placeholder>{p["sample_text"]}</p>')
    s = s.replace('Knee TeleRehab session sample', p['video_label'])
    s = s.replace('knee-sample', p['key'] + '-sample')
    for i in range(1, 5): s = s.replace(f'knee-testimonial-{i}', f'{p["key"]}-testimonial-{i}')
    s = s.replace('Participant, knee pain', p['testi_who'])
    # ---- phases, included
    s = between(s, r'<ol class="pg-phases__list" data-placeholder>', r'</ol>', phases(p['phases']))
    s = between(s, r'<ul class="pg-included__list" data-placeholder>', r'</ul>', included(p['inc']))
    # ---- fit
    def fit_ul(items, cls=''):
        return f'<ul class="pg-ticks pg-ticks--lines{cls}">\n' + ticks(items) + '            </ul>'
    m = re.search(r'(<div class="pg-fit-card pg-fit-card--yes">.*?)<ul class="pg-ticks pg-ticks--lines">.*?</ul>', s, re.S)
    s = s[:m.start()] + m.group(1) + fit_ul(p['fit_yes']) + s[m.end():]
    m = re.search(r'(<div class="pg-fit-card pg-fit-card--no">.*?)<ul class="pg-ticks pg-ticks--lines pg-ticks--x">.*?</ul>', s, re.S)
    s = s[:m.start()] + m.group(1) + fit_ul(p['fit_no'], ' pg-ticks--x') + s[m.end():]
    # ---- pricing
    s = s.replace('Knee Arthritis TeleRehab Programme</p>', plain(p['name']).replace('&', '&amp;') + '</p>')
    m = re.search(r'(<p class="pg-price-card__price" data-placeholder>.*?</p>\s*)<ul class="pg-ticks pg-ticks--lines" data-placeholder>.*?</ul>', s, re.S)
    s = s[:m.start()] + m.group(1) + '<ul class="pg-ticks pg-ticks--lines" data-placeholder>\n' + ticks(p['price_ticks']) + '          </ul>' + s[m.end():]
    # ---- FAQ
    s = between(s, r'<div class="faq__list pg-faq" data-placeholder>', r'\n        </div>', faq_html(p['faq']))
    # ---- decision
    s = s.replace("You can close this page and carry on managing with drugs and injections, and hope the knee pain eventually goes away. You may already know how that goes.", p['decision'])
    # ---- leftover check
    body = re.sub(r'<!--.*?-->', '', s, flags=re.S)
    body = re.sub(r'<nav aria-label="(Recovery programs|Conditions)">.*?</nav>', '', body, flags=re.S)
    left = re.findall(r'[^<>]{0,40}\b[Kk]nee[^<>]{0,40}', body)
    assert not left, (p['slug'], left[:5])
    open(os.path.join(ROOT, 'programmes', p['slug'] + '.html'), 'w', encoding='utf8').write(s)
    print('wrote', p['slug'], len(s) // 1024, 'KB')

for p in PAGES: build(p)
