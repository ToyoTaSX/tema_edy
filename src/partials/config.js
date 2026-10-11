// Конфиг для клиентских скриптов (без секретов): ID Метрики, ID группы ВК
export default ({ cafe }) =>
  `<script type="application/json" id="site-config">${JSON.stringify({
    metrikaId: cafe.site?.metrika_id ?? null,
    vkGroupId: 99941253,
  })}</script>`;
