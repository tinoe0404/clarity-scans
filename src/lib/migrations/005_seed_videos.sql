INSERT INTO videos (slug, language, title, description, blob_url, is_active, sort_order)
VALUES 
-- English
('what-is-ct', 'en', 'What is a CT Scan?', 'A brief introduction to the CT Scan procedure.', 'PLACEHOLDER', false, 1),
('prepare', 'en', 'Getting Ready', 'How to prepare for your scan.', 'PLACEHOLDER', false, 2),
('breathhold', 'en', 'Breath Hold Practice', 'Practice holding your breath for the scan.', 'PLACEHOLDER', false, 3),
('contrast', 'en', 'Contrast Dye', 'Information about the contrast dye.', 'PLACEHOLDER', false, 4),
('staying-still', 'en', 'Staying Still', 'Why it is important to stay perfectly still.', 'PLACEHOLDER', false, 5),

-- Shona
('what-is-ct', 'sn', 'CT Scan chii?', 'Tsananguro pfupi nezve CT Scan.', 'PLACEHOLDER', false, 1),
('prepare', 'sn', 'Kugadzirira', 'Magadzirirwo ekuita scan yako.', 'PLACEHOLDER', false, 2),
('breathhold', 'sn', 'Kudzidzira Kufema', 'Dzidzirai kubata mweya wenyu panguva ye scan.', 'PLACEHOLDER', false, 3),
('contrast', 'sn', 'Mvura inoonekwa (Contrast)', 'Ruzivo nezve mvura inoonekwa panguva ye scan.', 'PLACEHOLDER', false, 4),
('staying-still', 'sn', 'Kusazununguka', 'Kukosha kwekusazununguka panguva ye scan.', 'PLACEHOLDER', false, 5),

-- Ndebele
('what-is-ct', 'nd', 'Kuyini i-CT Scan?', 'Incazelo emfitshane nge CT Scan.', 'PLACEHOLDER', false, 1),
('prepare', 'nd', 'Ukulungiselela', 'Ungalungiselela njani ukuhlolwa kwakho.', 'PLACEHOLDER', false, 2),
('breathhold', 'nd', 'Ukuzehlwayela Ukuphefumula', 'Zehlwayele ukubamba umoya wakho.', 'PLACEHOLDER', false, 3),
('contrast', 'nd', 'Umuthi Wokubona (Contrast)', 'Ulwazi ngomuthi oncedisa ukubona kuhle emzimbeni.', 'PLACEHOLDER', false, 4),
('staying-still', 'nd', 'Ukunganyakazi', 'Kungani kuqakathekile ukuthi unganyakazi.', 'PLACEHOLDER', false, 5)
ON CONFLICT (slug, language) DO NOTHING;
