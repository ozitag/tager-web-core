type ShareParams = {
  url: string;
  title: string;
  image: string;
  description: string;
};

type SocialType = 'vk' | 'facebook';

function openSharePopup(url: string): void {
  window.open(url, '', 'toolbar=0,status=0,width=626,height=436');
}

function getOpenGraphParam(param: string) {
  const metaElement = document.querySelector<HTMLMetaElement>(
    'meta[property="og:' + param + '"]'
  );
  return metaElement?.content ?? '';
}

const shareHandlers = {
  vk: (params: ShareParams) => {
    const searchParams = new URLSearchParams();
    searchParams.set('url', params.url);
    searchParams.set('title', params.title);
    searchParams.set('description', params.description);
    searchParams.set('image', params.image);
    searchParams.set('noparse', 'true');

    openSharePopup('http://vkontakte.ru/share.php?' + searchParams.toString());
  },
  facebook: (params: { url: string }) => {
    const searchParams = new URLSearchParams();
    searchParams.set('u', params.url);

    openSharePopup(
      'https://www.facebook.com/sharer/sharer.php?' + searchParams.toString()
    );
  },
};

function share(socialType: SocialType): void {
  if (socialType === 'facebook') {
    shareHandlers.facebook({ url: document.location.href });
  }

  if (socialType === 'vk') {
    shareHandlers.vk({
      url: document.location.href,
      title: getOpenGraphParam('title'),
      description: getOpenGraphParam('description'),
      image: getOpenGraphParam('image'),
    });
  }
}

export default share;
